import { ChangeEventHandler, HTMLInputTypeAttribute } from 'react';

interface Props {
  id: string;
  label: string;
  placeholder?: string;
  value?: any;
  type?: HTMLInputTypeAttribute | undefined;
  step?: string;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
}

export function Input(props: Props) {
  return (
    <>
      <label
        htmlFor={props.id}
        className='mb-2 mt-6 block text-sm font-medium text-gray-900 dark:text-white'
      >
        {props.label}
      </label>
      <input
        {...props}
        className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
        onChange={props.onChange}
      />
    </>
  );
}
