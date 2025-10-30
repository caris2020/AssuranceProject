import React from 'react'
import clsx from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	intent?: 'primary' | 'secondary' | 'accent' | 'ghost'
	size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({ intent = 'primary', size = 'md', className, ...props }) => {
	const base = 'inline-flex items-center justify-center rounded-md font-medium focus-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
	const intents: Record<NonNullable<ButtonProps['intent']>, string> = {
		primary: 'bg-brand-600 hover:bg-brand-700 text-white',
		secondary: 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-900 dark:text-slate-100',
		accent: 'bg-accent-500 hover:bg-accent-600 text-slate-900',
		ghost: 'bg-transparent hover:bg-slate-900/5 text-slate-900 dark:text-slate-100',
	}
	const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
		sm: 'px-2.5 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-5 py-2.5 text-base',
	}

	return <button className={clsx(base, intents[intent], sizes[size], className)} {...props} />
}


