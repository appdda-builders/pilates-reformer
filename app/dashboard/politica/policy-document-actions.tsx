"use client"

import { useState } from "react"
import { Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog"
import {
  WELCOME_POLICY_PDF_FILENAME,
  WELCOME_POLICY_PDF_PATH,
} from "@/lib/hidden-registry"

export function PolicyDocumentActions() {
  const [viewerOpen, setViewerOpen] = useState(false)

  function handleDownload() {
    const link = document.createElement("a")
    link.href = WELCOME_POLICY_PDF_PATH
    link.download = WELCOME_POLICY_PDF_FILENAME
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="gap-2" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Descargar
        </Button>
        <Button
          type="button"
          className="gap-2"
          onClick={() => setViewerOpen(true)}
        >
          <ExternalLink className="h-4 w-4" />
          Ver en línea
        </Button>
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 pr-12 border-b shrink-0">
            <DialogTitle className="text-base">Políticas del estudio</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-muted/30">
            <iframe
              title="Políticas del estudio"
              src={`${WELCOME_POLICY_PDF_PATH}#toolbar=1&navpanes=0`}
              className="h-full w-full border-0"
            />
          </div>
          <div className="px-4 py-3 border-t shrink-0 flex flex-wrap gap-2 justify-end">
            <Button type="button" variant="outline" className="gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Descargar
            </Button>
            <Button type="button" onClick={() => setViewerOpen(false)}>
              Volver a políticas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
