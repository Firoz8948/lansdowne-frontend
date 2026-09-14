'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './shopNowButton.module.css';

export default function ShopNowButton({
  children,
  text = 'Shop Now',
  href,
  onClick,
  as,
  size = 'lg',
  className = '',
  showArrow = true,
  iconSize,
  ...rest
}) {
  const content = children || text;
  const computedIconSize = iconSize || (size === 'sm' ? 14 : size === 'md' ? 16 : 18);

  const combinedClassName = [
    styles.shopNowBtn,
    styles[size] || '',
    className,
  ].filter(Boolean).join(' ');

  const innerContent = (
    <>
      <span>{content}</span>
      {showArrow && <ArrowRight size={computedIconSize} />}
    </>
  );

  if (as === 'span') {
    return (
      <span className={combinedClassName} onClick={onClick} {...rest}>
        {innerContent}
      </span>
    );
  }

  if (as === 'div') {
    return (
      <div className={combinedClassName} onClick={onClick} {...rest}>
        {innerContent}
      </div>
    );
  }

  if (as === 'button' || (!href && onClick)) {
    return (
      <button type="button" className={combinedClassName} onClick={onClick} {...rest}>
        {innerContent}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className={combinedClassName} onClick={onClick} {...rest}>
        {innerContent}
      </Link>
    );
  }

  return (
    <span className={combinedClassName} onClick={onClick} {...rest}>
      {innerContent}
    </span>
  );
}
