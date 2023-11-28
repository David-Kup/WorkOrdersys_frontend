import React, { Component, Fragment, PureComponent } from "react";
import { Input, Form, Spin, Button, message } from "antd";
import { FormInstance } from 'antd/lib/form';

import { IPRangeService, IPRangeRespondParamsType } from "@/services/manage";

class IpDetail extends PureComponent<any, any> {
  formRef = React.createRef<FormInstance>();
  constructor(props) {
    super(props);
    this.state = {
      typeId : 1,
      ipInfo: {},
      ipId: this.props.ipId,
      loading: false
    };
  }

  componentDidMount() {
    if (this.props.ipId !== 0 ) {
      this.fetchIpDetailData(this.props.ipId);
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.ipId !== prevState.ipId) {
      return {
        ipId: nextProps.ipId
      }
    }
    return null;

  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
    if (this.props.ipId && this.props.ipId !== prevProps.ipId) {
      this.fetchIpDetailData(this.props.ipId);
    }
  }

  fetchIpDetailData = async (ipId) => {
    this.setState({loading: true});
    //
    const result = await IPRangeService.get(ipId);
    if (result.code == 200) {
      console.log(result.data)
      this.setState({ipInfo: result.data});
      // todo: set field
      let newValue = result.data;
      this.formRef.current.setFieldsValue(newValue);
    }
    this.setState({loading: false});
  }
  onTypeChange = (e) => {
    this.setState({
      typeId: Number(e.target.value),
    });
  }


  onFinish = async (value) => {
    this.setState({loading: true});
    if (this.state.ipId !== 0 ) {
      // todo: update
      const result = await IPRangeService.update(this.state.ipId, value);
      if (result.code == 200) {
        message.success('更新成功');
        this.props.reloadList();

      } else {
        message.error(`更新失败: ${result.msg}`);
      }

    } else {
      const result = await IPRangeService.create( value);
      if (result.code == 200) {
        message.success('新增成功');
        this.props.reloadList();

      } else {
        message.error(`新增失败:${result.msg}`);
      }
    }

    this.setState({loading: false});
  }


  render() {
    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const tailLayout = {
      wrapperCol: { offset: 8, span: 16 },
    };

    return (
      <Spin spinning={this.state.loading}>
        <Form
          name="basic"
          onFinish={this.onFinish}
          ref={this.formRef}
          {...layout}
        >
          <Form.Item
            label="开始"
            name="first_ip"
            rules={[{ required: true, message: 'Please input start ip!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="last_ip" label="结尾"
                    rules={[{ required: true, message: 'Please input end ip!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              确定
            </Button>

          </Form.Item>



        </Form>
      </Spin>
    )
    }


}

export default  IpDetail;
