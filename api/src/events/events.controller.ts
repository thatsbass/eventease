import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { UploadsService } from "src/uploads/uploads.service"
import { SWAGGER } from "src/constants"
import { CreateEventDto } from "./dto/create-event.dto"
import { CreateTicketTypeDto } from "./dto/create-ticket-type.dto"
import { UpdateEventCoverDto } from "./dto/update-event-cover.dto"
import { UpdateEventDto } from "./dto/update-event.dto"
import { UpdateTicketTypeDto } from "./dto/update-ticket-type.dto"
import { EventsService } from "./events.service"

@ApiTags(SWAGGER.tags.events)
@Controller("events")
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly uploadsService: UploadsService,
  ) {}


  @Get("public")
  @ApiOperation({ summary: SWAGGER.events.listPublic })
  listPublic() {
    return this.eventsService.listPublic()
  }

  @Get("public/:publicId")
  @ApiOperation({ summary: SWAGGER.events.getPublicByPublicId })
  getPublicByPublicId(@Param("publicId") publicId: string) {
    return this.eventsService.getPublicByPublicId(publicId)
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.listMine })
  listMine(@Req() req: any) {
    return this.eventsService.listMine(req.user.sub)
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.getById })
  getById(@Req() req: any, @Param("id") id: string) {
    return this.eventsService.getById(req.user.sub, id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.create })
  create(@Req() req: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user.sub, dto)
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.update })
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(req.user.sub, id, dto)
  }

  @Patch(":id/cover")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.updateCover })
  updateCover(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateEventCoverDto) {
    return this.eventsService.updateCover(req.user.sub, id, dto.coverImage)
  }

  @Post(":id/cover/upload")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
      required: ["file"],
    },
  })
  @ApiOperation({ summary: SWAGGER.events.uploadCover })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadEventCover(@Req() req: any, @Param("id") id: string, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub as string
    
    await this.eventsService.getById(userId, id)

    const uploaded = await this.uploadsService.uploadImage(file, {
      folder: `eventease/events/${id}`,
      public_id: "cover",
      overwrite: true,
      context: "event_cover",
    })

    return this.eventsService.updateCover(userId, id, uploaded.optimized_url)
  }

  @Patch(":id/publish")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.publish })
  publish(@Req() req: any, @Param("id") id: string) {
    return this.eventsService.publish(req.user.sub, id)
  }

  @Patch(":id/unpublish")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.unpublish })
  unpublish(@Req() req: any, @Param("id") id: string) {
    return this.eventsService.unpublish(req.user.sub, id)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.remove })
  remove(@Req() req: any, @Param("id") id: string) {
    return this.eventsService.delete(req.user.sub, id)
  }

  // Ticket types
  @Post(":id/ticket-types")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.addTicketType })
  addTicketType(@Req() req: any, @Param("id") eventId: string, @Body() dto: CreateTicketTypeDto) {
    return this.eventsService.addTicketType(req.user.sub, eventId, dto)
  }

  @Patch("ticket-types/:ticketTypeId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.updateTicketType })
  updateTicketType(
    @Req() req: any,
    @Param("ticketTypeId") ticketTypeId: string,
    @Body() dto: UpdateTicketTypeDto,
  ) {
    return this.eventsService.updateTicketType(req.user.sub, ticketTypeId, dto)
  }

  @Delete("ticket-types/:ticketTypeId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.events.deleteTicketType })
  deleteTicketType(@Req() req: any, @Param("ticketTypeId") ticketTypeId: string) {
    return this.eventsService.deleteTicketType(req.user.sub, ticketTypeId)
  }
}
