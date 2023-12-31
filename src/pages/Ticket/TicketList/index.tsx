import React, {Component} from "react";
import moment from 'moment';
// import styles from "./index.less";
import "./index.less";
import {Table, message, Modal, Col, Form, Input, Row, DatePicker, Button, Select, Popconfirm, Collapse} from "antd";
import { useIntl } from 'umi';
import {addCommentRequest, delTicketRequest, getTicketList} from '@/services/ticket';
import { getCompanyList } from '@/services/user';
import TicketDetail from "@/pages/Ticket/TicketDetail";
import { getWorkflowList, getWorkflowState } from "@/services/workflows";

const { RangePicker } = DatePicker;
let timeout;
let currentValue;
const { TextArea } = Input;

class TicketList extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      ticketResult: [],
      workflowResult: [],
      ticketListLoading: false,
      deleteVisible: false,
      deleteId: 0,
      searchArgs: {},
      userResult: [],
      searchCompanyResult: [],
      searchStateList: [],
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        onChange: (current) => {
          const pagination = { ...this.state.pagination };
          pagination.page = current;
          pagination.current = current;
          this.setState({ pagination }, () => {
            this.fetchTicketData({
              page: pagination.page,
              per_page: pagination.pageSize
            })
          });
        }
      }
    };
  }
  formRef = React.createRef<FormInstance>();

  componentDidMount() {
    this.fetchTicketData({});
    this.fetchWorkflowData();
    this.fetchCompanyData({"per_page":10000});
    this.fetchStateListData({"per_page":10000});
  };

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
    if (this.props.reloadFlag !== prevProps.reloadFlag) {
      this.fetchTicketData({});
    }
  }

  fetchTicketData = async (values) => {
    this.setState({ticketListLoading: true})
    values.category = this.props.category;
    if(this.props.parentTicketId){
      values.parent_ticket_id = this.props.parentTicketId
    }
    values = Object.assign(values, this.state.searchArgs);
    const result = await getTicketList(values);
    if (result.code === 0) {
      const pagination = { ...this.state.pagination };
      pagination.current = result.data.page;
      pagination.pageSize = result.data.per_page;
      pagination.total = result.data.total;

      this.setState({ticketResult: result.data.value, ticketListLoading: false, pagination});
    } else {
      message.error(result.msg);
      this.setState({ticketListLoading: false});
    }
  };

  fetchWorkflowData = async () => {
    const result = await getWorkflowList({per_page: 1000})
    if (result.code === 0) {
      this.setState({workflowResult: result.data.value});
    } else {
      message.error(result.msg);
    }

  }

  showTicketDetail = (ticketId) => {
    this.setState({
      openTicketId: ticketId,
      visible: true,
    });
  };

  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false,
      deleteVisible: false
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
      deleteVisible: false
    });
  };

  handleTicketOk = () => {
    this.setState({visible:false});
    this.fetchTicketData({});
  }

  deleteOk = async(values:any) => {
    const result = await delTicketRequest(this.state.deleteId, values);
    if (result.code === 0){
      message.success('删除成功');
      this.setState({deleteVisible: false});
      this.fetchTicketData({});
    } else {
      message.error(`删除失败：${result.msg}`);
    }
  }

  showDeleteModal = (ticketId:number) => {
    this.setState({deleteVisible: true, deleteId:ticketId});
  }


  searchTicket = (values) => {
    if (values.create_time){
      if (values.create_time[0]){
        values.create_start = values.create_time[0].format('YYYY-MM-DD HH:mm:ss')
      }
      if (values.create_time[1]){
        values.create_end = values.create_time[1].format('YYYY-MM-DD HH:mm:ss')
      }
      delete(values.create_time)

    }
    this.setState({searchArgs: values})
    this.fetchTicketData(values);
  }

  fetchCompanyData = async(params: object) => {
    const result = await getCompanyList(params);
    if (result.code === 0 ){
      this.setState({searchCompanyResult: result.data.value})
    }
  }

  fetchStateListData = async(params: object)=>{
    const result = await getWorkflowState(1, params);//workflowid = 1
    if (result.code ===0){
      this.setState({searchStateList: result.data.value})
    }
  }

  // Custom render function for each row on mobile
  renderMobileRow = (record) => {
    const intl = useIntl();
    // Extract the department name and company name
    const deptName = record?.participant_dept?.name == undefined ? "" : record?.participant_dept?.name;
    const companyName = record?.participant_dept?.company?.name == undefined ? "" : `(${record?.participant_dept?.company?.name})`;

    const renderAction = () => {
      if (["all", "intervene"].indexOf(this.props.category) !== -1 && !this.props.parentTicketId) {
        return (
          <span>
            <a style={{marginRight: 5}} onClick={() => this.showTicketDetail(record.id)}>{intl.formatMessage({id: 'component.ticketlist.modal.ticketDetail'})}</a> |
            <a onClick={() => this.showDeleteModal(record.id)} style={{color:'red', marginLeft: 5}}>{intl.formatMessage({id: 'component.ticketlist.modal.ticketDel'})}</a>

          </span>
        )
      } else {
        return (
          <span>
            <a style={{marginRight: 5}} onClick={() => this.showTicketDetail(record.id)}>{intl.formatMessage({id: 'component.ticketlist.modal.ticketDetail'})}</a>
          </span>
        )
      }
    }

    // Format and return the string
    return (
      <Collapse bordered={false} defaultActiveKey={1}>
        <Collapse.Panel header={`Details for Ticket ID: ${record.id}`} key="1">
          {/* Render the details of the ticket here */}
          <p>{`${intl.formatMessage({id: 'component.ticketlist.table.sn'})}: ${record.sn}`}</p>
          <p>{`${intl.formatMessage({id: 'component.ticketlist.table.state'})}: ${record.state.state_name}`}</p>
          <p>{`${intl.formatMessage({id: 'component.ticketlist.table.creator'})}: ${record.creator}`}</p>
          <p>{`${intl.formatMessage({id: 'component.ticketlist.table.company'})}: ${record.creator_info.company ? record.creator_info.company.name: ''}`}</p>
          <p>{`${intl.formatMessage({id: 'component.ticketlist.table.department'})}: ${deptName} ${companyName}`}</p>
          <p>{`${intl.formatMessage({id: 'component.ticketlist.table.action'})}: `} {renderAction()}</p>
          {/* Add more details as needed */}
        </Collapse.Panel>
      </Collapse>
    );
  };

  onExpand = (expanded, record) => {
    const keys = expanded ? [record.id] : [];
    this.setState({ expandedRowKeys: keys });
  };



  render() {
    const userOptions = this.state.userResult.map(d => <Select.Option key={d.value}>{d.text}</Select.Option>);
    const { intl } = this.props;
    const columns = [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
      },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.sn'}),
        dataIndex: "sn",
        key: "sn"
      },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.title'}),
        dataIndex: "title",
        key: "title"
      },
      // {
      //   title: "类型",
      //   dataIndex: "workflow_info",
      //   key: "workflow_info",
      //   render: (text: { workflow_name: any }) => (
      //     text.workflow_name
      //   )
      // },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.state'}),
        dataIndex: "state",
        key: "state",
        render: (text: { state_name: string }) => (
          text.state_name
        )
      },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.creator'}),
        dataIndex: "creator",
        key: "creator"
      },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.company'}),
        dataIndex: ["creator_info", "company", "name"],
        key: "company"
      },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.department'}),
        dataIndex: ["participant_dept", "name"],
        key: "department",
        render: (text, record) => {
          // Extract the department name and company name
          const deptName = record?.participant_dept?.name == undefined ? "" : record?.participant_dept?.name;
          const companyName = record?.participant_dept?.company?.name == undefined ? "" : `(${record?.participant_dept?.company?.name})`;
      
          // Format and return the string
          return `${deptName} ${companyName}`;
        }
      },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.created_at'}),
        dataIndex: "gmt_created",
        key: "gmt_created"
      },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.action'}),
        key: "action",
        render: (text: string, record: any) => {
          if (["all", "intervene"].indexOf(this.props.category) !== -1 && !this.props.parentTicketId) {
            return (
              <span>
                <a style={{marginRight: 5}} onClick={() => this.showTicketDetail(record.id)}>详情</a> |
                <a onClick={() => this.showDeleteModal(record.id)} style={{color:'red', marginLeft: 5}}>删除</a>

              </span>
            )
          } else {
            return (
              <span>
                <a style={{marginRight: 5}} onClick={() => this.showTicketDetail(record.id)}>详情</a>
              </span>
            )
          }
        }
  }
    ];

    const columnsInMobile = [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
      },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.title'}),
        dataIndex: "title",
        key: "title"
      },
      {
        title: intl.formatMessage({id: 'component.ticketlist.table.created_at'}),
        dataIndex: "gmt_created",
        key: "gmt_created"
      }
    ];

    const getFields = () => {
      const children = [
        <Col span={8} key={"titleCol"}>
          <Form.Item
            name={"title"}
            label={intl.formatMessage({id: 'component.ticketlist.table.title'})}
          >
            <Input placeholder="支持标题模糊查询" />
          </Form.Item>
        </Col>,
        // <Col span={6} key={"workflowId"}>
        //   <Form.Item
        //     name={"workflow_ids"}
        //     label={"工单类型"}
        //   >
        //     <Select
        //       showSearch
        //       // labelInValue
        //       style={{ width: 200 }}
        //       placeholder="选择工单类型"
        //       optionFilterProp="children"
        //       filterOption={(input, option) =>
        //         Select.Option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        //       }
        //     >
        //       {this.state.workflowResult.map(d => (
        //         <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
        //       ))}
        //     </Select>
        //   </Form.Item>

        // </Col>,
        <Col span={8} key={"companyId"}>
          <Form.Item
            name={"company_id"}
            label={intl.formatMessage({id: 'component.ticketlist.table.company'})}
          >
            <Select
              showSearch
              // labelInValue
              // style={{ width: 200 }}
              placeholder="公司A"
              optionFilterProp="children"
              filterOption={(input, option) =>
                Select.Option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.state.searchCompanyResult.map(d => (
                <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>,
        <Col span={8} key={"creator"}>
          <Form.Item
            name={"creator"}
            label={intl.formatMessage({id: 'component.ticketlist.table.creator'})}
          >
            <Input placeholder="请填写工单创建人" />
          </Form.Item>
        </Col>,
        // <Col span={8} key={"department"}>
        //   <Form.Item
        //     name={"department"}
        //     label={"部门"}
        //   >
        //     <Input placeholder="请填写工单部门" />
        //   </Form.Item>
        // </Col>,
        <Col span={8} key={"sn"}>
          <Form.Item
            name={"sn"}
            label={intl.formatMessage({id: 'component.ticketlist.table.sn'})}
          >
            <Input placeholder="请输入工单流水号" />
          </Form.Item>
        </Col>,
        <Col span={8} key={"create_time"}>
          <Form.Item
            name={"create_time"}
            label={intl.formatMessage({id: 'component.ticketlist.table.created_at'})}
          >
            <RangePicker
              showTime={{
                hideDisabledOptions: true,
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm:ss "
            />
          </Form.Item>
        </Col>,
        // <Col span={6} key={"create_time"}>
        //   <Form.Item
        //       name="urgency_level"
        //       label="程度"
        //     >
        //       <Select
        //         showSearch
        //         // labelInValue
        //         // style={{ width: 200 }}
        //         placeholder="普通"
        //         optionFilterProp="children"
        //         filterOption={(input, option) =>
        //           Select.Option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        //         }
        //         defaultValue={this.state.urgencyLevel}
        //         onChange={(value)=>{
        //           this.setState({ urgencyLevel: value })
        //         }}
        //       >
        //         {['紧急', '普通', '暂缓'].map(d => (
        //           <Select.Option key={'urgency level:'+d} value={d}>{d}</Select.Option>
        //         ))}
        //       </Select>
        //     </Form.Item>
        // </Col>,
        <Col span={8} key={"stateIds"}>
          <Form.Item
            name={"state_ids"}
            label={intl.formatMessage({id: 'component.ticketlist.table.state'})}
          >
            <Select
              showSearch
              // labelInValue
              // style={{ width: 200 }}
              // mode="multiple"
              placeholder="未处理"
              optionFilterProp="children"
              filterOption={(input, option) =>
                Select.Option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.state.searchStateList.map(d => (
                <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>,
      ]
      return children;
    };

    return (
      <div>
        {!this.props.parentTicketId? <Form
          name="advanced_search"
          className="ant-advanced-search-form"
          ref={this.formRef}
          onFinish={this.searchTicket}
        >
          <Row gutter={24}>{getFields()}</Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                {intl.formatMessage({id: 'component.ticketlist.btn.find'})}
              </Button>
              <Button
                style={{ margin: '0 8px' }}
                onClick={() => {
                  this.formRef.current.resetFields();
                }}
              >
                {intl.formatMessage({id: 'component.ticketlist.btn.init'})}
              </Button>
            </Col>
          </Row>

        </Form>: null}

        <div id="components-table-demo-basic" className="desktop-only">
          {this.props.parentTicketId && this.state.ticketResult.length ?
            <Table loading={this.state.ticketListLoading}
                   title={()=>{return '子工单'}}
                   columns={columns}
                   dataSource={this.state.ticketResult}
                   rowKey={record=>record.id}
                   pagination={this.state.pagination}
            />
          : null
          }
          {!this.props.parentTicketId? <Table loading={this.state.ticketListLoading}
                                               columns={columns}
                                               dataSource={this.state.ticketResult}
                                               rowKey={record=>record.id}
                                               pagination={this.state.pagination}
          />: null}

        </div>
        <div id="components-table-demo-basic" className="mobile-only">
          {this.props.parentTicketId && this.state.ticketResult.length ?
            <Table loading={this.state.ticketListLoading}
                   title={()=>{return '子工单'}}
                   columns={columnsInMobile}
                   dataSource={this.state.ticketResult}
                   rowKey={record=>record.id}
                   pagination={this.state.pagination}
                   expandable={{
                    expandedRowRender: this.renderMobileRow,
                    rowExpandable: record => record.id !== 'notExpandable',
                    onExpand: this.onExpand,
                   }}
            />
          : null
          }
          {!this.props.parentTicketId? <Table loading={this.state.ticketListLoading}
                                               columns={columnsInMobile}
                                               dataSource={this.state.ticketResult}
                                               rowKey={record=>record.id}
                                               pagination={this.state.pagination}
                                               expandable={{
                                                expandedRowRender: this.renderMobileRow,
                                                rowExpandable: record => record.id !== 'notExpandable',
                                                onExpand: this.onExpand,
                                               }}
          />: null}

        </div>

        <Modal
          title={`${intl.formatMessage({id: 'component.ticketlist.modal.ticketDetail'})}: #${this.state.openTicketId}`}
          width={1024}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose
          footer={null}

        >
          <TicketDetail category={this.props.category} ticketId={this.state.openTicketId} handleTicketOk={()=>this.handleTicketOk()}/>
        </Modal>

        <Modal
          title={intl.formatMessage({id: 'component.ticketlist.modal.ticketDel'})}
          visible={this.state.deleteVisible}
          onCancel={this.handleCancel}
          footer={null}>
          <Form
            onFinish={this.deleteOk}
          >
            <Form.Item
              name="suggestion"
            >
              <TextArea
                placeholder="请输入删除原因"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button">
                {intl.formatMessage({id: 'component.ticketlist.modal.submit'})}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

      </div>
    )
  }
}

// export default TicketList;

const IntlWrapper = (props) => {
  const intl = useIntl();
  return <TicketList intl={intl} {...props} />;
}

export default IntlWrapper;
