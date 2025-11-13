export interface ITableHeader<T extends Record<string, string>> {
  title: string;
  field: keyof T;
  className?: string;
  classCol?: string;
}
