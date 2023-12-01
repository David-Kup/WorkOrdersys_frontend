import {Form, Input, Card, Button, Checkbox, Col, Row, message, Select} from 'antd';
import React, {Component} from 'react';
import {getWorkflowInitState} from "@/services/workflows";
import { newTicketRequest } from '@/services/ticket';


class NewTicket extends Component<any, any> {
  constructor(props) {
    super();
    this.state = {
      workflowResult: [],

    };
  }

  componentDidMount() {
    this.fetchWorkflowInitData();
  }


  onFinish = async (values) => {
    console.log('success:', values);
    // 新建工单
    values.workflow_id = Number(1);
    values.transition_id= Number(1);
    const result = await newTicketRequest(values)
    if (result.code === 0) {
      message.success('创建工单成功');
      this.props.newTicketOk(result.data.ticket_id)
      // #tode 刷新页面,关闭弹窗
    } else {
      message.error(result.msg);
    }
  };

  onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };



  fetchWorkflowInitData = async () => {
    const result = await getWorkflowInitState({workflowId: 1})
    if (result.code === 0) {
      this.setState({workflowResult: result.data.value});
    } else {
      message.error(result.msg);
    }

  }


  render(){
    const layout = {
      labelCol: { span: 4},
      wrapperCol: { span: 12},
    };

    const tailLayout = {
      wrapperCol: { offset:22},
    };



    return (
      <Card title='Submit work order'>
        <Form
          {...layout}
          name="basic"
          initialValues = {{ remember: true}}
          onFinish={this.onFinish}
          onFinishFailed={this.onFinishFailed}
        >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message:'please input title'}]}
            >
              <Input allowClear />
            </Form.Item>

            <Form.Item
              label="Content"
              name="content"
              rules={[{ required: true, message:'please input content'}]}
            >
              <Input.TextArea allowClear />
            </Form.Item>
            <Form.Item
              name={"urgency_level"}
              label={"urgency level"}
            >
              <Select
                showSearch
                // labelInValue
                style={{ width: 200 }}
                placeholder="normal"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  Select.Option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                defaultValue={'normal'}
              >
                {['urgent', 'normal', 'suspended'].map(d => (
                  <Select.Option key={'urgency level:'+d} value={d}>{d}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Form.Item>
        </Form>
      </Card>

    )
  }

}

export default NewTicket;
