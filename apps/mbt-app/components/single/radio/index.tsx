const Radio = (props: {
  checked?: boolean;
  id?: string;
  name?: string;
}) => {
  const { checked, id, name, ...rest } = props;
  return (
    <input
      id={id}
      name={name}
      type="radio"
      checked={checked}
      readOnly
      className={`before:contet[""] relative h-5 w-5 cursor-pointer appearance-none rounded-full checked:before:bg-accent-500
       dark:checked:!border-accent-400 dark:checked:before:!bg-accent-400
       border !border-accent-200 transition-all duration-[0.2s] before:absolute before:top-[3px]
       before:left-[50%] before:h-3 before:w-3 before:translate-x-[-50%] before:rounded-full before:transition-all before:duration-[0.2s] dark:!border-gray-800
       `}
      {...rest}
    />
  );
};

export default Radio;
