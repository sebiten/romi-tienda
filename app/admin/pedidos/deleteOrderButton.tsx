"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, AlertTriangle } from "lucide-react"

export function DeleteOrderButton({
    orderId,
    deleteAction,
}: {
    orderId: string
    deleteAction: (orderId: string) => Promise<void>
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        startTransition(async () => {
            await deleteAction(orderId)
        })
    }

    return (
        <>
            <Button
                type="button"
                onClick={() => setIsOpen(true)}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
                <Trash2 className="h-4 w-4" />
                Eliminar
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md bg-white border-beige-200">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl text-beige-800">Confirmar eliminación</DialogTitle>
                        </div>
                        <DialogDescription className="text-beige-600">
                            ¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer y se eliminarán todos
                            los productos asociados.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-beige-50 p-3 rounded-lg border border-beige-200">
                        <p className="text-sm text-beige-700">
                            <span className="font-semibold">ID del pedido:</span> #{orderId.slice(-8).toUpperCase()}
                        </p>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                            className="border-beige-300 text-beige-700 hover:bg-beige-100"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isPending ? "Eliminando..." : "Eliminar pedido"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
