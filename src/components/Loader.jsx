import { forwardRef } from 'react';
import cx from 'clsx';
import { Box } from '@mantine/core';
import classes from './styles/Loader.module.css';

const Loader = forwardRef(({ className, ...others }, ref) => (
  <Box component="span" className={cx(classes.loader, className)} {...others} ref={ref} />
));

export default Loader