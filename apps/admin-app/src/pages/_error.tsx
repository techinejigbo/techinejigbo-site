import React from 'react';

export default function Error() {
  return <div>Error occurred.</div>;
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
