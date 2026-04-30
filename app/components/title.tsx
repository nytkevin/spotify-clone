type TitleProps = {
  heading: string;
};

export default function Title({ heading }: TitleProps) {
  return <p className="font-bold uppercase tracking-wide">{heading}</p>;
}
