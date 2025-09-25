'use client';

import * as React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ListCardContextValue = {
  onLoadMore?: () => Promise<void> | void;
};

const ListCardContext = React.createContext<ListCardContextValue>({});

export type ListCardProps = {
  children: React.ReactNode;
  onLoadMore?: () => Promise<void> | void;
  className?: string;
};

export function ListCard({ children, onLoadMore, className }: ListCardProps) {
  const ctx = React.useMemo(() => ({ onLoadMore }), [onLoadMore]);
  return (
    <ListCardContext.Provider value={ctx}>
      <div className={cn(className)}>{children}</div>
    </ListCardContext.Provider>
  );
}

export type ListCardHeaderProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export function ListCardHeader({
  children,
  icon,
  className,
}: ListCardHeaderProps) {
  return (
    <CardHeader className={className}>
      <CardTitle className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
        {icon}
        {children}
      </CardTitle>
    </CardHeader>
  );
}

export type ListCardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function ListCardContent({ children, className }: ListCardContentProps) {
  const { onLoadMore } = React.useContext(ListCardContext);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!onLoadMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        onLoadMore();
      }
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore]);

  return (
    <CardContent className={cn('px-4', className)}>
      <div className='flex flex-col gap-3'>
        {children}
        {/* Sentinel for infinite loading */}
        {onLoadMore ? <div ref={sentinelRef} className='h-1' /> : null}
      </div>
    </CardContent>
  );
}

export type CardDataProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardData({ children, className }: CardDataProps) {
  const childArray = React.Children.toArray(children);

  const isCardDataTitle = (
    child: React.ReactNode
  ): child is React.ReactElement<CardDataTitleProps> =>
    React.isValidElement(child) && child.type === CardDataTitle;

  const isCardDataDescription = (
    child: React.ReactNode
  ): child is React.ReactElement<CardDataDescriptionProps> =>
    React.isValidElement(child) && child.type === CardDataDescription;

  const isCardDataRightValue = (
    child: React.ReactNode
  ): child is React.ReactElement<CardDataRightValueProps> =>
    React.isValidElement(child) && child.type === CardDataRightValue;

  const isCardDataTimestamp = (
    child: React.ReactNode
  ): child is React.ReactElement<CardDataTimestampProps> =>
    React.isValidElement(child) && child.type === CardDataTimestamp;

  const title = childArray.find(isCardDataTitle);
  const description = childArray.find(isCardDataDescription);
  const rightValue = childArray.find(isCardDataRightValue);
  const timestamp = childArray.find(isCardDataTimestamp);

  return (
    <div className={cn('rounded-lg p-4', className)}>
      <div className='flex flex-col gap-1'>
        {title}
        {(description || rightValue) && (
          <div className='flex items-center gap-2'>
            {description ? (
              <div className='min-w-0 flex-1 truncate'>{description}</div>
            ) : null}

            {rightValue ? <div className='shrink-0'>{rightValue}</div> : null}
          </div>
        )}
        {timestamp ? (
          <div className='flex items-center justify-end gap-2'>{timestamp}</div>
        ) : null}
      </div>
    </div>
  );
}

export type CardDataTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardDataTitle({ children, className }: CardDataTitleProps) {
  return <p className={cn('text-base font-semibold', className)}>{children}</p>;
}

export type CardDataDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardDataDescription({
  children,
  className,
}: CardDataDescriptionProps) {
  return <p className={cn('text-gray-600', className)}>{children}</p>;
}

export type CardDataRightValueProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardDataRightValue({
  children,
  className,
}: CardDataRightValueProps) {
  return (
    <p className={cn('text-right font-semibold', className)}>{children}</p>
  );
}

export type CardDataTimestampProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardDataTimestamp({
  children,
  className,
}: CardDataTimestampProps) {
  return (
    <p className={cn('text-right text-xs text-gray-600', className)}>
      {children}
    </p>
  );
}

export default ListCard;
