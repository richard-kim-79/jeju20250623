import { InputHTMLAttributes } from 'react';

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full px-4 py-2 rounded bg-black border border-gray-700 text-white ' +
        'focus:ring-2 focus:ring-[#1d9bf0] outline-none ' +
        (props.className || '')
      }
    />
  );
} 