import {Form, Input, Card, Button, Checkbox, Col, Row, message, Select, Upload} from 'antd';
import {UploadOutlined} from "@ant-design/icons/lib";
import React, {Component} from 'react';
import {getWorkflowInitState} from "@/services/workflows";
import { newTicketRequest } from '@/services/ticket';


class NewTicket extends Component<any, any> {
  constructor(props) {
    super();
    this.state = {
      workflowResult: [],
      urgencyLevel: '普通'
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
      // this.props.newTicketOk(result.data.ticket_id)
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
          initialValues = {{ remember: true, urgency_level: this.state.urgencyLevel}}
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
              label="Attach"
              name="content"
            >
              <Upload action="api/v1.0/tickets/upload_file" listType="text" multiple={true} >
              {/*child = <Upload action="api/v1.0/tickets/upload_file" listType="text" onChange={(info)=>this.fileChange(item.field_key, info)}>*/}
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="urgency_level"
              label="程度"
            >
              <Select
                showSearch
                // labelInValue
                style={{ width: 200 }}
                placeholder="普通"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  Select.Option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                defaultValue={this.state.urgencyLevel}
                onChange={(value)=>{
                  this.setState({ urgencyLevel: value })
                }}
              >
                {['紧急', '普通', '暂缓'].map(d => (
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
