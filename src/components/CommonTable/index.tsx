import { Table } from 'antd';

/**
 *  ======组件属性=======
 *  （初级用法）
 *  tableProps          必须,table的属性配置
 *  handleTableChange   非必须，使用了筛选以及排序功能或者不开启run查询时则必须 （pagination，filterValues，sortValues） => {}
 *  transformFilter 非必须，筛选时处理函数  values => newValues，不设置则使用默认处理
 *  transformSorter  非必须，排序时处理函数  values => newValues,不设置则使用默认处理
 *  （中级用法）
 *  run  非必须，执行函数
 *  formValues 非必须，表单值
 *  （高级用法）
 *  dynamicValues  非必须，动态参数
 */

const CommonTable = (props: any) => {
  const {
    tableProps,
    handleTableChange,
    transformFilter,
    transformSorter,
    run,
    formValues,
    dynamicValues,
  } = props;

  const onChange = (pagination: any, filters: any, sorter: any) => {
    // sorter支持多列排序，设置sorter:{ multiple: 1 } 标识多列排序（multiple数字越小，使用前端排序越优先，使用后端排序时也默认遵从此规则），设置为true标识单列排序
    let sorterResult: any = [];
    if (sorter && Array.isArray(sorter)) {
      // 多列排序  sorter是个数组，先按照优先级排序
      sorterResult = sorter.sort((a, b) => a.column.sorter.multiple - b.column.sorter.multiple);
    } else if (sorter && Object.keys(sorter).length) {
      // 单列排序  sorter是个对象
      sorterResult = [sorter];
    }
    // 取消多列或者单列排序时，也会存在一个sorter,但是order为undefined，因此过滤且不参与排序
    sorterResult = sorterResult.filter((i: any) => !!i.order);
    /**
     * sorter处理。若无自定义处理函数，则默认方式处理
     */
    if (transformSorter) {
      sorterResult = transformSorter(sorterResult);
    } else {
      // 默认转换为 key  value结构
      const preSorter = [...sorterResult];
      sorterResult = {};
      preSorter.forEach((item) => {
        sorterResult[item['field']] = item['order'];
      });
    }
    /**
     *  filter处理。若无自定义处理函数，则默认方式处理
     */
    let filtersResult = { ...filters };
    if (transformFilter) {
      filtersResult = transformFilter(filtersResult);
    } else {
      // 默认使用filters进行全选时,改变传参为undefined
      const filterColumns = tableProps.columns.filter((i: any) => !!i.filters);
      for (const k in filters) {
        const target = filterColumns.find((i: any) => i.dataIndex === k);
        if (target.filters.length === filters[k].length) {
          filtersResult[k] = undefined;
        } else {
          filtersResult[k] = filters[k];
        }
      }
    }
    handleTableChange?.(pagination, filtersResult, sorterResult);
    const runParams = {
      current: pagination.current,
      size: pagination.pageSize,
      ...filtersResult,
      ...sorterResult,
      ...formValues,
      ...dynamicValues,
    };
    run?.(runParams);
  };
  // 全局分页属性
  const globalPageProps = {
    pageSizeOptions: ['10', '20', '50', '100'],
    showQuickJumper: true,
    showSizeChanger: true,
    showTotal: (total: number) => `总共${total || 0}条记录`,
    simple: false,
    size: 'default',
  };
  // 注入全局分页属性
  const tableFinallyProps = {
    ...tableProps,
    pagination: !tableProps.pagination ? false : { ...globalPageProps, ...tableProps.pagination },
  };
  return <Table onChange={onChange} {...tableFinallyProps} />;
};
export default CommonTable;

CommonTable.defaultProps = {
  dynamicValues: {},
};
