import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { UploadApiResponse, v2 as cloudinary } from "cloudinary"
import { Readable } from "stream"
import { MESSAGES } from "src/constants"

type UploadImageParams = {
  folder: string
  public_id?: string
  overwrite?: boolean
  invalidate?: boolean
  context?: "avatar" | "organizer_cover" | "event_cover" | string
}

type UploadedImageResult = {
  public_id: string
  secure_url: string
  optimized_url: string
}

@Injectable()
export class UploadsService {
  private configured = false

  constructor(private readonly config: ConfigService) {}

  async uploadImage(
    file: Express.Multer.File,
    params: UploadImageParams,
  ): Promise<UploadedImageResult> {
    const env = this.getEnvOrThrow()
    this.ensureCloudinaryConfigured(env)

    if (!file?.buffer?.length) {
      throw new BadRequestException(MESSAGES.uploads.fileRequired)
    }

    if (!file.mimetype?.startsWith("image/")) {
      throw new BadRequestException(MESSAGES.uploads.onlyImageUploadsSupported)
    }

    const folder = this.sanitizePath(params.folder)
    const public_id = params.public_id ? this.sanitizePath(params.public_id) : undefined

    const options: Record<string, any> = {
      folder,
      public_id,
      overwrite: params.overwrite ?? true,
      invalidate: params.invalidate ?? false,
      resource_type: "image",
    }

    if (params.context) {
      options.context = `type=${this.sanitizeContext(params.context)}`
    }

    const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error)
        if (!result) {
          return reject(new InternalServerErrorException(MESSAGES.uploads.cloudinaryUploadFailed))
        }
        resolve(result)
      })

      Readable.from([file.buffer]).pipe(uploadStream)
    })

    return {
      public_id: uploaded.public_id,
      secure_url: uploaded.secure_url,
      optimized_url: uploaded.secure_url,
    }
  }

  private ensureCloudinaryConfigured(env: { cloudName: string; apiKey: string; apiSecret: string }) {
    if (this.configured) return

    cloudinary.config({
      cloud_name: env.cloudName,
      api_key: env.apiKey,
      api_secret: env.apiSecret,
      secure: true,
    })

    this.configured = true
  }

  private getEnvOrThrow() {
    const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME")
    const apiKey = this.config.get<string>("CLOUDINARY_API_KEY")
    const apiSecret = this.config.get<string>("CLOUDINARY_API_SECRET")

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(MESSAGES.uploads.cloudinaryNotConfigured)
    }

    return { cloudName, apiKey, apiSecret }
  }

  private sanitizePath(value: string) {
    const v = value.trim().replace(/\\/g, "/")
    if (!v) throw new BadRequestException(MESSAGES.uploads.invalidValue)
    if (!/^[a-zA-Z0-9/_-]+$/.test(v)) throw new BadRequestException(MESSAGES.uploads.invalidValue)
    return v
  }

  private sanitizeContext(value: string) {
    const v = value.trim()
    if (!v) throw new BadRequestException(MESSAGES.uploads.invalidContext)
    if (v.length > 50) throw new BadRequestException(MESSAGES.uploads.invalidContext)
    if (!/^[a-zA-Z0-9._-]+$/.test(v)) throw new BadRequestException(MESSAGES.uploads.invalidContext)
    return v
  }
}
