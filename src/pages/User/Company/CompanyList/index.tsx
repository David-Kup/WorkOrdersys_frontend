import React, { Component } from "react";
import {Table, Col, Form, Input, Card, Row, Button, Modal, Select, Radio, message, Popconfirm} from "antd";
import {addCompanyRequest, delCompanyRequest, getCompanyList, queryUserSimple, updateCompanyRequest} from "@/services/user";


const { Option } = Select;

class CompanyList extends Component<any, any> {
  constructor(props) {
    super();
    this.state = {
      companyResult: [],
      allCompanyResult: [],
      companyDetail: {},
      companyResultLoading: false,
      companyModalVisible: false,
      searchLeaderResult: [],
      searchApproverResult: [],
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        onChange: (current) => {
          const pagination = { ...this.state.pagination };
          pagination.page = current;
          pagination.current = current;
          this.setState({ pagination }, () => {
            this.fetchCompanyData({
              page: pagination.page,
              per_page: pagination.pageSize
            })
          });
        }
      }
    }
  }

  componentDidMount() {
    this.fetchCompanyData({per_page:10, page:1});
    this.fetchAllCompanyData();
  }
  
  fetchAllCompanyData = async() => {
    const allResult = await getCompanyList({per_page: 10000, page:1});
    if (allResult.code === 0) {
      this.setState({allCompanyResult: allResult.data.value});
    } else {
      message.error(`获取全部部门列表失败: ${allResult.msg}`);
    }
  }

  fetchCompanyData = async(params: object) => {
    this.setState({companyResultLoading: true})
    const result = await getCompanyList(params);
    if (result.code === 0 ){
      const pagination = { ...this.state.pagination };
      pagination.current = result.data.page;
      pagination.pageSize = result.data.per_page;
      pagination.total = result.data.total;


      this.setState({companyResult: result.data.value, companyResultLoading:false, pagination})
    } else {
      message.error(`获取部门列表失败: ${result.msg}`)
      this.setState({companyResultLoading:false})
    }

  }

  searchCompany = (values) => {
    this.fetchCompanyData({...values, per_page:10, page:10})
  }

  showCompanyModal = (record: any) => {
    this.setState({
      companyDetail: record,
      companyModalVisible: true,

    })
  }

  getCompanyDetailField = (fieldName:string) =>{
    if(this.state && this.state.companyDetail && this.state.companyDetail[fieldName]){
      if (fieldName === 'approver') {
        return this.state.companyDetail[fieldName].split(',');
      }
      return this.state.companyDetail[fieldName]
    }
    return ''
  }

  delCompany = async(companyId) => {
    const result = await delCompanyRequest(companyId);
    if (result.code ===0 ) {
      message.success('删除成功');
      this.fetchCompanyData({});
      this.fetchAllCompanyData();
    } else {
      message.error(`删除失败: ${result.msg}`)
    }
  }

  onCompanyFinish = async(values: any) => {
    let result = {};
    if (this.state.companyDetail && this.state.companyDetail.id) {
      result = await updateCompanyRequest(this.state.companyDetail.id, values);
    } else {
      result = await addCompanyRequest(values);
    }
    if (result.code === 0) {
      message.success('保存成功');
      this.setState({companyModalVisible: false, companyDetail: {}});
      this.fetchCompanyData({});
      this.fetchAllCompanyData();
    } else {
      message.error(`保存失败: ${result.msg}`);
    }
  }

  handleCompanyOk = () =>{
    this.setState({
      companyModalVisible: false
    })
  }

  handleCompanyCancel = () =>{
    this.setState({
      companyModalVisible: false
    })
  }

  searchLeader = async(search_value: string) => {
    const result = await queryUserSimple({search_value:search_value});
    if (result.code ===0 ) {
      this.setState({searchLeaderResult: result.data.value});
    }
  }

  searchApprover = async(search_value: string) => {
    const result = await queryUserSimple({search_value:search_value});
    if (result.code ===0 ) {
      this.setState({searchApproverResult: result.data.value});
    }
  }


  render(){
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "创建人",
        dataIndex: "creator",
        key: "creator"
      },
      {
        title: "描述",
        dataIndex: "description",
        key: "description"
      },
      {
        title: "创建时间",
        dataIndex: "gmt_created",
        key: "gmt_created"
      },
      {
        title: "操作",
        key: "action",
        render: (text: string, record: any) => (
          <span>
            <a style={{marginRight: 16}} onClick={() => this.showCompanyModal(record)}>编辑</a>
            <a style={{marginRight: 16, color: "red"}}>
              <Popconfirm
                title="确认删除么"
                onConfirm={()=>{this.delCompany(record.id)}}
              >
                删除
              </Popconfirm>
            </a>
          </span>

        )

      }
    ]
    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const tailLayout = {
      wrapperCol: { offset: 8, span: 16 },
    };

    return (
      <div>
        <Card>
          <Form
            name="advanced_search"
            className="ant-advanced-search-form"
            onFinish={this.searchCompany}
          >
            <Row gutter={24}>
              <Col span={6} key={"search_value"}>
                <Form.Item
                  name={"search_value"}
                  label={"查询"}
                >
                  <Input placeholder="支持部门名称模糊查询" />
                </Form.Item>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={()=>this.showCompanyModal(0)}>
                  新增
                </Button>
              </Col>
            </Row>
          </Form>
          <Table loading={this.state.companyResultLoading} columns={columns} dataSource={this.state.companyResult}
                 rowKey={record => record.id} pagination={this.state.pagination}/>
        </Card>
        <Modal
          title="部门"
          visible={this.state.companyModalVisible}
          onOk={this.handleCompanyOk}
          onCancel={this.handleCompanyCancel}
          width={800}
          footer={null}
          destroyOnClose
        >
          <Form
            {...layout}
            onFinish={this.onCompanyFinish}
          >
            <Form.Item name="name" label="名称" rules={[{ required: true }]} initialValue={this.getCompanyDetailField('name')}>
              <Input />
            </Form.Item>

            <Form.Item name="description" label="描述" initialValue={this.getCompanyDetailField('description')}>
              <Input />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Form.Item>

          </Form>
        </Modal>

      </div>

    )
  }


}

export default CompanyList;