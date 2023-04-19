import styles from './accordion.module.css';
import { ReactNode, useRef, useState } from 'react';
import AnimateHeight from 'react-animate-height';

export default ({ heading, actions = null, children }: { actions?: ReactNode; heading?: ReactNode , children?: ReactNode}) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleContent = () => {
    setIsOpened((_isOpened) => {
      const nextOpenedState = !_isOpened;
      if(contentRef.current) {
        contentRef.current.style.height = nextOpenedState ? 'auto' : '0px';
      }
      return nextOpenedState;
    })

  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.titleContainer} onClick={toggleContent} >
          {isOpened ? (
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0.625492 6.39069L6.60599 0.56094C6.71104 0.45855 6.85193 0.401245 6.99862 0.401245C7.14531 0.401245 7.2862 0.45855 7.39124 0.56094L13.374 6.39069C13.423 6.43839 13.4619 6.49541 13.4885 6.5584C13.5151 6.62139 13.5288 6.68907 13.5288 6.75744C13.5288 6.82581 13.5151 6.89349 13.4885 6.95648C13.4619 7.01947 13.423 7.0765 13.374 7.12419C13.2735 7.22232 13.1387 7.27725 12.9982 7.27725C12.8578 7.27725 12.723 7.22232 12.6225 7.12419L6.99862 1.64207L1.37587 7.12419C1.27546 7.22198 1.14084 7.2767 1.00068 7.2767C0.860521 7.2767 0.725901 7.22198 0.625492 7.12419C0.576506 7.0765 0.537571 7.01947 0.510985 6.95648C0.4844 6.89349 0.470703 6.82581 0.470703 6.75744C0.470703 6.68907 0.4844 6.62139 0.510985 6.5584C0.537571 6.49541 0.576506 6.43839 0.625492 6.39069Z"
                fill="#6B6B6B"
              />
            </svg>
          ) : (
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M13.3743 1.28777L7.39376 7.11753C7.28872 7.21992 7.14783 7.27722 7.00114 7.27722C6.85445 7.27722 6.71356 7.21992 6.60851 7.11753L0.625764 1.28777C0.576777 1.24008 0.537843 1.18305 0.511257 1.12006C0.484672 1.05707 0.470976 0.989395 0.470976 0.921025C0.470976 0.852654 0.484672 0.784976 0.511257 0.721985C0.537843 0.658995 0.576777 0.60197 0.625764 0.554274C0.726224 0.456149 0.861084 0.401215 1.00151 0.401215C1.14194 0.401215 1.2768 0.456149 1.37726 0.554274L7.00114 6.0364L12.6239 0.554274C12.7243 0.456486 12.8589 0.401764 12.9991 0.401764C13.1392 0.401764 13.2739 0.456486 13.3743 0.554274C13.4233 0.60197 13.4622 0.658995 13.4888 0.721985C13.5154 0.784976 13.5291 0.852654 13.5291 0.921025C13.5291 0.989395 13.5154 1.05707 13.4888 1.12006C13.4622 1.18305 13.4233 1.24008 13.3743 1.28777Z"
                fill="#6B6B6B"
              />
            </svg>
          )}
          {heading}
        </div>
        <div>{actions}</div>
      </div>
      <AnimateHeight
        id="example-panel"
        duration={500}
        height={isOpened ? 'auto' : 0}
      >
        {children}
      </AnimateHeight>
    </div>
  );
};
