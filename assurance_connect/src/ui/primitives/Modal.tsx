import React, { PropsWithChildren, useEffect } from 'react'
import { Button } from './Button'

type ModalProps = PropsWithChildren<{
	open: boolean
	title?: string
	onClose: () => void
}>

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children }) => {
	useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden'
			return () => {
				document.body.style.overflow = ''
			}
		}
	}, [open])

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50">
			<div className="absolute inset-0 bg-slate-900/50" aria-hidden="true" onClick={onClose} />
			<div className="absolute inset-0 flex items-center justify-center p-4">
				<div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 shadow-xl max-h-[90vh] flex flex-col">
					<div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
						<h3 className="text-base font-semibold">{title}</h3>
						<Button intent="ghost" onClick={onClose} aria-label="Fermer">✕</Button>
					</div>
					<div className="p-4 overflow-y-auto flex-1">
						{children}
					</div>
				</div>
			</div>
		</div>
	)
}


