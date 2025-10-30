import React from 'react'

type Props = {
	checked: boolean
	onChange: (checked: boolean) => void
}

export const ThemeToggle: React.FC<Props> = ({ checked, onChange }) => {
	return (
		<label className="inline-flex items-center gap-2 text-sm">
			<span>Thème</span>
			<button
				type="button"
				aria-pressed={checked}
				className={`relative inline-flex h-6 w-11 items-center rounded-full focus-ring ${checked ? 'bg-slate-700' : 'bg-slate-300'}`}
				onClick={() => onChange(!checked)}
			>
				<span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-1'}`}></span>
			</button>
		</label>
	)
}


