import {Form, Input, Card, Button, Checkbox, Col, Row, message, Select, Upload, Spin, Modal} from 'antd';
import {UploadOutlined} from "@ant-design/icons/lib";
import React, {Component} from 'react';
import { Gallery } from 'react-grid-gallery';

import {getWorkflowInitState} from "@/services/workflows";
import { newTicketRequest, uploadRequest, updateTicketRequest } from '@/services/ticket';
import { SERVER_URL } from '../../../../config/API';

class NewTicket extends Component<any, any> {
  constructor(props) {
    super();
    this.state = {
      workflowResult: [],
      urgencyLevel: '普通',
      isLoading: false,
      images: props.ticketInfo ? props.ticketInfo.value['file_list'].map((item: any) => {
        return {
          src: `${SERVER_URL}/media/ticket_file/${item}`,
          thumbnail: `${SERVER_URL}/media/ticket_file/${item}`,
          thumbnailWidth: 320,
          thumbnailHeight: 212,
          isSelected: false,
          caption: 'Image Caption',
        }
      }) : [],
      previewImage: null,
      previewVisible: false,
    };
  }

  componentDidMount() {
    if(this.props.ticketId) {
      this.setState({ urgencyLevel: this.props.ticketInfo?.value?.urgency_level })
    }

    this.fetchWorkflowInitData();
  }


  onFinish = async (values) => {
    this.setState({isLoading: true});
    Promise.all(values.attach?.fileList.map((file) => this.customRequest({file: file?.originFileObj, onSuccess: ()=>{}, onError: ()=>{}})) || [])
    .then(async results => {
      console.log(results);
      values.workflow_id = Number(1);
      values.transition_id= Number(1);

      const combinedValues = {
        ...values,
        attachement: [...results],
      };
      delete combinedValues.attach;
  
      console.log('Received values:', combinedValues);
      var result;
      if (this.props.ticketInfo) {
        let updated_images = this.state.images.map((img: object) => {
        const url = img['src'];
        // Create a URL object
        const urlObject = new URL(url);
        // Get the pathname (e.g., /media/ticket_file/a766f8f4-960a-11ee-81b9-509a4c1bfabc.png)
        const pathname = urlObject.pathname;
        // Use the split method to get the filename
        const filename = pathname.split('/').pop();
        return filename;
        })
        combinedValues['attachement'] = [...combinedValues['attachement'], ...updated_images]
        console.log('updated values:', combinedValues);
        result = await updateTicketRequest(this.props.ticketInfo.value.id, combinedValues)
      }
      else {
        console.log(combinedValues)
        result = await newTicketRequest(combinedValues)
      }
      if (result.code === 0) {
        message.success('创建工单成功');
        // this.props.newTicketOk(result.data.ticket_id)
        // #tode 刷新页面,关闭弹窗
      } else {
        message.error(result.msg);
      }
  
      this.setState({isLoading: false});
    })
    .catch(err => {
      this.setState({isLoading: false});
    })
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

  customRequest = async ({ file, onSuccess, onError }) => {
    try {
      console.log(typeof file)
      console.log(file)
      const formData = new FormData();
      formData.append('file', file);

      // Assuming you have a function to send the file to the backend
      const response = await this.uploadFile(formData);
      // Handle success, e.g., update UI
      console.log('Upload successful:', response);
      onSuccess();

      // Optionally, you can display a success message
      message.success('File uploaded successfully');
      return response.data.file_name;
    } catch (error) {
      // Handle error, e.g., show error message
      console.error('Upload error:', error);
      onError(error);

      // Optionally, you can display an error message
      message.error('Failed to upload file');
    }
  };

  uploadFile = async (formData) => {
    console.log(formData);
    const response = await uploadRequest(formData)
    
    if(response.code === 0) {
      return response;
    }
    else {
      throw new Error(response.error);
    }

  };

  onChange = ({ file, fileList }) => {
    // Check if a file is removed
    if (file.status === 'removed') {
      // Update the state with the remaining files
      // this.setState({
      //   fileList,
      // });
      console.log(file, fileList);
    }
  };

  handlePreview = (index: number) => {
    const previewImage = this.state.images[index];
    this.setState({ previewImage, previewVisible: true });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handleDelete = (index: number) => {
    const updatedImages = [...this.state.images];
    updatedImages.splice(index, 1);
    this.setState({ images: updatedImages });
  };

  render(){
    const layout = {
      labelCol: { span: 4},
      wrapperCol: { span: 12},
    };

    const tailLayout = {
      wrapperCol: { offset:22},
    };


    return (
      <Spin spinning={this.state.isLoading}>
        <Card title='提交工单'>
          <Form
            {...layout}
            name="basic"
            initialValues = {{ remember: true, urgency_level: this.state.urgencyLevel}}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            disabled={(this.props.category=='owner'|| this.props.category=='all') ? false : true}
          >
              <Form.Item
                label="标题"
                name="title"
                rules={[{ required: true, message:'please input title'}]}
                initialValue={this.props.ticketInfo?.value?.title}
              >
                <Input allowClear />
              </Form.Item>

              <Form.Item
                label="内容"
                name="content"
                rules={[{ required: true, message:'please input content'}]}
                initialValue={this.props.ticketInfo?.value?.content}
              >
                <Input.TextArea allowClear />
              </Form.Item>
              <Form.Item 
                label="附"
                name="attach"
              >
                <Upload /*customRequest={this.customReuest}*/ listType="text" multiple={true} onChange={this.onChange} >
                {/*child = <Upload action="api/v1.0/tickets/upload_file" listType="text" onChange={(info)=>this.fileChange(item.field_key, info)}>*/}
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
              <Form.Item
                label="多媒体"
                name="multimedia"
                style={{ display: this.props.ticketInfo ? "" : "none"}}
              >
                {this.props.ticketInfo ? <div>
                  <Gallery
                    images={this.state.images}
                    enableLightbox={false}
                    onClick={(i) => this.handlePreview(i)}
                  />
                  <Modal
                    visible={this.state.previewVisible}
                    footer={null}
                    onCancel={this.handleCancel}
                  >
                    {this.state.previewImage && (
                      <img alt="Preview" style={{ width: '100%' }} src={this.state.previewImage.src} />
                    )}
                    <Button style={{marginTop: 10}} type="danger" onClick={() => this.handleDelete(this.state.images.indexOf(this.state.previewImage))}>
                      删除
                    </Button>
                  </Modal>
                </div> : null}
                  
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
                  { this.props.ticketId ? <span>更新</span> : <span>创造</span>}
                </Button>
              </Form.Item>
          </Form>
        </Card>
      </Spin>
    )
  }

}

export default NewTicket;
