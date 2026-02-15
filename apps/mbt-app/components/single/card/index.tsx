function Card(props: {
  variant?: string;
  extra?: string;
  children?: React.ReactNode;
  [x: string]: any;
}) {
  const { variant, extra, children, ...rest } = props;

  return (
    <div
      className={`!z-5 relative flex flex-col rounded-[20px] bg-white bg-clip-border ${
        props.default
          ? "shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
          : "shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      } border border-gray-200 dark:!bg-dark-700 dark:text-white dark:border-white/10 dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)] ${extra}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
