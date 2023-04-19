import cn from 'classnames';
import { LabelHTMLAttributes } from 'react';
import styles from './label.module.css';

export interface Props extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

const Label: React.FC<Props> = ({ className, ...rest }) => {
  return <label className={cn(styles.inputLabel, className)} {...rest} />;
};

export default Label;
