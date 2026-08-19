import { pill, dot } from './SearchStatusPill.css';

interface SearchStatusPillProps {
  message: string;
}

export function SearchStatusPill({ message }: SearchStatusPillProps) {
  return (
    <div className={pill}>
      <span className={dot} />
      {message}
    </div>
  );
}
