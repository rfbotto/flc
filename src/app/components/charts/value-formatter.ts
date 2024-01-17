const valueFormatter = (number: number) => `${new Intl.NumberFormat("de-DE").format(number).toString()}k`;
export default valueFormatter