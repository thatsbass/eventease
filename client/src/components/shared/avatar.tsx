
import { Avatar, Float } from "@chakra-ui/react"
import { PiSealCheckFill } from "react-icons/pi"

type Props = {
    name: string
    url?: string
    isCertified? : boolean
}

const UserAvatar = ({ name, url, isCertified=true }: Props) => {
    return (
        <Avatar.Root>
            <Avatar.Fallback name={name} />
            <Avatar.Image objectPosition={"top"} src={url || "#"} />
            <Float hidden={!isCertified} placement="top-end" offsetX="1" offsetY="1">
                <PiSealCheckFill size={"12px"} color="white" />
            </Float>
        </Avatar.Root>
    )
}


export default UserAvatar;