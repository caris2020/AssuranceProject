import React, { useRef } from 'react'

type FileMeta = {
	name: string
	size: number
	type: string
}

type Props = {
	label?: string
	multiple?: boolean
	onFilesChange?: (files: File[]) => void
	accept?: string
}

export const FileInput: React.FC<Props> = ({ label = 'Choisir des fichiers', multiple = true, onFilesChange, accept }) => {
	const inputRef = useRef<HTMLInputElement | null>(null)

	const openPicker = () => {
		inputRef.current?.click()
	}

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files ? Array.from(e.target.files) : []
		onFilesChange?.(files)
	}

	return (
		<div>
			<input ref={inputRef} type="file" className="hidden" multiple={multiple} onChange={onChange} accept={accept} />
			<button type="button" onClick={openPicker} className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
				📎 {label}
			</button>
		</div>
	)
}

export const toFileMeta = (files: File[]): FileMeta[] => files.map(f => ({ name: f.name, size: f.size, type: f.type }))


