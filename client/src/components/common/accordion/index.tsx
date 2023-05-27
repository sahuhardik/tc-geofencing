import styles from './accordion.module.css';
import { ReactNode, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import AnimateHeight from 'react-animate-height';
import ChevronUp from '@components/icons/chevron-up';

export default ({
  isOn = false,
  heading,
  actions = null,
  children,
  headerClasses = '',
  containerClasses = '',
}: {
  isOn?: boolean;
  actions?: ReactNode;
  heading?: ReactNode;
  children?: ReactNode;
  headerClasses?: string;
  containerClasses?: string;
}) => {
  const [isOpened, setIsOpened] = useState<boolean>(isOn);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpened(isOn);
  }, [isOn]);

  const toggleContent = () => {
    setIsOpened((_isOpened) => {
      const nextOpenedState = !_isOpened;
      if (contentRef.current) {
        contentRef.current.style.height = nextOpenedState ? 'auto' : '0px';
      }
      return nextOpenedState;
    });
  };

  return (
    <div className={cn([styles.container, containerClasses])}>
      <div className={cn([styles.headerContainer, headerClasses])}>
        <div className={styles.titleContainer} onClick={toggleContent}>
          <span className={cn(styles.chevron, isOpened && styles.chevronDown)}>
            <ChevronUp />
          </span>
          {heading}
        </div>
        <div>{actions}</div>
      </div>
      <AnimateHeight id="example-panel" duration={200} height={isOpened ? 'auto' : 0}>
        {children}
      </AnimateHeight>
    </div>
  );
};
