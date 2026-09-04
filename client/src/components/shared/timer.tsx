'use client'

import { useEffect, useState } from "react"
const UseTimer = () => {
    const [timeLabel, setTimeLabel] = useState("")

    useEffect(() => {
        const formatter = new Intl.DateTimeFormat("fr-FR", {
            timeZone: "Africa/Dakar",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })

        const updateTime = () => {
            setTimeLabel(formatter.format(new Date()))
        }

        updateTime()
        const intervalId = window.setInterval(updateTime, 30_000)

        return () => window.clearInterval(intervalId)
    }, [])

    return { time: timeLabel }
}

export default UseTimer;