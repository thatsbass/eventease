import { Injectable } from "@nestjs/common"
import React from "react"
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import { OrderTicketsPdfData } from "./tickets-pdf.types"

@Injectable()
export class TicketsPdfService {
  async renderOrderTicketsPdf(data: OrderTicketsPdfData): Promise<Buffer> {
    const doc = this.buildDocument(data)
    return renderToBuffer(doc)
  }

  private buildDocument(data: OrderTicketsPdfData) {
    const styles = StyleSheet.create({
      page: { padding: 32, fontSize: 11 },
      header: { marginBottom: 16 },
      title: { fontSize: 18, fontWeight: 700 },
      subtitle: { marginTop: 4, color: "#444" },
      section: { marginTop: 16 },
      ticket: {
        borderWidth: 1,
        borderColor: "#111",
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
      },
      ticketRow: { flexDirection: "row", justifyContent: "space-between" },
      ticketLabel: { color: "#555" },
      code: { fontSize: 16, fontWeight: 700, letterSpacing: 1 },
      footer: { marginTop: 18, color: "#666", fontSize: 10 },
    })

    const eventDate = this.formatEventDate(data.startAt, data.timezone)

    const TicketBox = (ticket: OrderTicketsPdfData["tickets"][number]) =>
      React.createElement(
        View,
        { key: ticket.code, style: styles.ticket },
        React.createElement(
          View,
          { style: styles.ticketRow },
          React.createElement(Text, null, ticket.ticketTypeName),
          React.createElement(Text, { style: styles.code }, ticket.code),
        ),
        React.createElement(
          View,
          { style: { marginTop: 8 } },
          React.createElement(Text, null, `${eventDate}`),
          React.createElement(Text, null, data.location),
        ),
        React.createElement(
          View,
          { style: { marginTop: 8 } },
          React.createElement(Text, { style: styles.ticketLabel }, "Nom"),
          React.createElement(Text, null, data.buyerName),
        ),
      )

    return React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: "A4", style: styles.page },
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.title }, "Vos tickets"),
          React.createElement(
            Text,
            { style: styles.subtitle },
            `${data.eventTitle} • ${eventDate} • ${data.eventPublicId}`,
          ),
        ),
        React.createElement(
          View,
          { style: styles.section },
          ...data.tickets.map((t) => TicketBox(t)),
        ),
        React.createElement(
          Text,
          { style: styles.footer },
          "Présentez ce document à l'entrée. Gardez vos tickets confidentiels.",
        ),
      ),
    )
  }

  private formatEventDate(date: Date, timezone?: string) {
    try {
      return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: timezone || undefined,
      }).format(date)
    } catch {
      return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(date)
    }
  }
}
