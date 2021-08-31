import { useState, useEffect } from 'react';
import { Form, Button, Modal, Input, Select, DatePicker, Cascader, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { transformOption } from '@/utils/support';
import { createService, isSuccess } from '@/utils/requestUtils';
import styles from './index.less';

/**
 *  ======组件属性=======
 *  form           非必须，form实例，默认由useForm生成。若需要操控表单可设置
 *
 *  formItems   必须，自定义渲染配置项
 *  visible  必须，控制modal的显隐
 *  onCancel 必须，关闭弹框的方法
 *  record   必须，新增设置为{}，编辑设置为当前点击record
 *  defaultValues   非必须，默认值，若存在默认值则自动给表单赋值。编辑时编辑数据优先
 *  mapPropsToFields  非必须，自定义默认值以及record的回显逻辑 values => newValues
 *  transformModalValues  非必须，自定义表单数据处理逻辑   values => newValues
 *  refresh  必须，新增时以refresh()调用，编辑时以refresh(true)调用
 *  urls  必须，类型为  string |  Array<string>  新增以及编辑接口url   例如：'/save'  |   ['/create','/update']
 *
 *  showInfo  是否打印必要信息，默认false
 */
const DefaultFormItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const CommonModalForm = (props: any) => {
  const {
    form: propsForm,
    formItems,
    visible,
    onCancel,
    record,
    defaultValues,
    mapPropsToFields,
    transformModalValues,
    refresh,
    urls,
  } = props;
  const [form] = propsForm || Form.useForm();
  const { setFieldsValue, resetFields } = form;
  const [loading, setLoading] = useState(false);
  const isEdit = record && Object.keys(record).length; // 是否是编辑

  useEffect(() => {
    if (visible) {
      if (isEdit) {
        setFieldsValue(
          mapPropsToFields?.({ ...defaultValues, ...record }) || { ...defaultValues, ...record },
        );
      } else {
        setFieldsValue(mapPropsToFields?.(defaultValues) || defaultValues);
      }
    } else {
      resetFields();
      setLoading(false);
    }
  }, [visible]);

  async function onFinish(fieldsValue: any) {
    // 自定义数据处理
    const values = transformModalValues?.(fieldsValue) || fieldsValue;
    // 去空格处理
    for (const v in values) {
      if (typeof values[v] === 'string') {
        values[v] = values[v]?.trim();
      }
    }
    const finallyValues = { ...record, ...values };
    let currentUrl = '';
    if (isEdit) {
      currentUrl = Array.isArray(urls) && urls.length === 2 ? urls[1] : urls;
    } else {
      currentUrl = Array.isArray(urls) && urls.length === 2 ? urls[0] : urls;
    }
    console.log(`当前执行操作：${isEdit ? '编辑' : '新增'}`, ` 请求路径：${currentUrl}`);
    console.log('请求参数', finallyValues);
    setLoading(true);
    const request = createService(currentUrl, 'post');
    const response = await request(finallyValues);
    setLoading(false);
    if (isSuccess(response)) {
      message.success(isEdit ? '编辑成功' : '新增成功');
      onCancel();
      refresh(!isEdit);
    } else {
      message.error(response.statusCode);
    }
  }

  const ButtonGroup = () => {
    return (
      <div className={styles.buttonGroup}>
        <Button onClick={onCancel}>
          <CloseOutlined />
          取消
        </Button>
        <Button type="primary" onClick={() => form.submit()} loading={loading}>
          <CheckOutlined />
          保存
        </Button>
      </div>
    );
  };

  const RenderForm = () => {
    const resultItems = formItems.map((item: any) => {
      const { enumType } = item;
      switch (enumType) {
        case 'input': {
          delete item.enumType;
          const { key, title, placeholder, rules, ...rest } = item;
          return (
            <FormItem key={key} name={key} label={title} rules={rules}>
              <Input
                autoComplete="off"
                allowClear
                placeholder={placeholder || '请输入'}
                {...rest}
              />
            </FormItem>
          );
        }
        case 'select': {
          delete item.enumType;
          const {
            key,
            title,
            placeholder,
            rules,
            selectOptions = [],
            keyValue = ['value', 'label'],
            ...rest
          } = item;
          return (
            <FormItem key={key} name={key} label={title} rules={rules}>
              <Select
                allowClear
                showSearch
                placeholder={placeholder || '请选择'}
                filterOption={(input: any, option: any) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                {...rest}
              >
                {transformOption(selectOptions, keyValue)}
              </Select>
            </FormItem>
          );
        }
        case 'datePicker': {
          delete item.enumType;
          const { key, title, placeholder, rules, ...rest } = item;
          return (
            <FormItem key={key} name={key} label={title} rules={rules}>
              <DatePicker
                allowClear
                placeholder={placeholder || '请选择'}
                style={{ width: '100%' }}
                getPopupContainer={(trigger) => trigger.parentNode}
                {...rest}
              />
            </FormItem>
          );
        }
        case 'rangePicker': {
          delete item.enumType;
          const { key, title, placeholder, rules, ...rest } = item;
          return (
            <FormItem key={key} name={key} label={title} rules={rules}>
              <RangePicker
                allowClear
                placeholder={placeholder || ['开始时间', '结束时间']}
                getPopupContainer={(trigger) => trigger.parentNode}
                {...rest}
              />
            </FormItem>
          );
        }
        case 'cascader': {
          delete item.enumType;
          const { key, title, placeholder, rules, ...rest } = item;
          return (
            <FormItem key={key} name={key} label={title} rules={rules}>
              <Cascader
                allowClear
                placeholder={placeholder || '请选择'}
                expandTrigger="hover"
                getPopupContainer={(trigger) => trigger.parentNode}
                {...rest}
              />
            </FormItem>
          );
        }
        // 自定义渲染
        case 'custom': {
          delete item.enumType;
          const { key, title, rules } = item;
          return (
            <FormItem key={key} name={key} label={title} rules={rules}>
              {item?.render?.()}
            </FormItem>
          );
        }
        // 默认只提供占位
        default: {
          delete item.enumType;
          const { key } = item;
          return <FormItem key={key} />;
        }
      }
    });
    resultItems.push(<ButtonGroup key="buttonGroup" />);
    return resultItems;
  };

  return (
    <Modal
      className={styles.modalForm}
      forceRender
      visible={visible}
      title={isEdit ? '编辑' : '新增'}
      onCancel={onCancel}
      footer={false}
      closable
    >
      <Form form={form} onFinish={onFinish} {...DefaultFormItemLayout}>
        <RenderForm />
      </Form>
    </Modal>
  );
};
export default CommonModalForm;