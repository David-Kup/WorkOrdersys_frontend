import React, { Component } from 'react';
import {Table, Button, Modal, message, Popconfirm, Switch, Spin} from "antd";

import { IPRangeService, IPRangeRespondParamsType, IPTurnRespondParamsType } from '@/services/manage';
import IpDetail from './detail';


class WhiteListRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ipRestrictionLoading: false,
      whiteList: [],
      showModal: false,
      openWhiteListId: 0,
      turnOnOff: true
    };
  }

  componentDidMount() {
    this.fetchWhiteListData();
  }

  showDetail(id: number) {
    // IPRangeService.get(id).then((res) => {
    //   console.log(res);
    // })
    // .catch(err => console.log(err));
    console.log(`whitelistid: ${id}`)
    this.setState({
      openWhiteListId: id,
      showModal: true,
    })
  }

  handleOk = e => {
    this.setState({
      showModal: false,
    })
  }

  handleCancel = e => {
    this.setState({
      showModal: false,
    })
  }

  reloadList =() => {
    this.setState({
      showModal: false,
    });
    this.fetchWhiteListData();
  }

  fetchWhiteListData = async () => {
    this.setState({ ipRestrictionLoading: true });
    let listProomise = IPRangeService.list().then((res: IPRangeRespondParamsType) => {
      console.log(res.data);
      this.setState({ whiteList: res.data });
    })
    .catch(err => {
      console.log(err);
    });

    let isTurnPromise = IPRangeService.isTurn().then((res: IPTurnRespondParamsType) => {
      console.log(res.data);
      let turnOnOff = res.data.action == 'D' ? true : false;
      console.log(turnOnOff);
      this.setState({ turnOnOff: turnOnOff })
    })
    .catch(err => {
      console.log(err);
    });

    Promise.all([listProomise, isTurnPromise])
    .then(() => this.setState({ipRestrictionLoading: false}))
    .catch(err => this.setState({ipRestrictionLoading: false}));
  }

  deleteConfirm = async (id) =>{
    const result = await IPRangeService.delete(id);
    if (result.code == 200) {
      message.success('删除成功');
      this.fetchWhiteListData();
    } else {
      message.error(`删除失败: ${result.msg}`);
    }
  }

  onChange = async () => {
    this.setState({ipRestrictionLoading: true});
    const result = await IPRangeService.turnOnOff();
    if (result.code == 200) {
      message.success('成功');
      this.setState((prev) => ({turnOnOff: !prev.turnOnOff}))
    } else {
      message.error(`失败: ${result.msg}`);
    }

    this.setState({ipRestrictionLoading: false});
  }

  render() {
    const columns = [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "开始",
        dataIndex: "first_ip",
        key: "start",
      },
      {
        title: "结尾",
        dataIndex: "last_ip",
        key: "end",
      },
      {
        title: "操作",
        key: "action",
        render: (text: string, record: any) => (
          <span>
            <a style={{marginRight: 16}} onClick={ ()=>this.showDetail(record.id)}>编辑</a>
            <Popconfirm
              title="确认删除此通知记录? 请在删除前确认没有工作流使用该通知"
              onConfirm={()=>this.deleteConfirm(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <a href="#" style={{color: "red"}}>删除</a>
            </Popconfirm>
          </span>
        )
      }
    ]

    const openWhiteListId = this.state.openWhiteListId;

    return (
      <div>
        <Spin spinning={this.state.ipRestrictionLoading}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <Button type="primary" style={{ marginBottom: 16 }} onClick={()=>this.showDetail(0)} >
              新建
            </Button>

            <Switch checked={this.state.turnOnOff} onChange={this.onChange} checkedChildren="开" unCheckedChildren="关" />
          </div>
        </Spin>
        <Table loading={this.state.ipRestrictionLoading} columns={columns} dataSource={this.state.whiteList}
              rowKey={record => record.id}/>

        <Modal
          title="IP范围"
          visible={this.state.showModal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer= {null}
          destroyOnClose
        >
          <IpDetail ipId={openWhiteListId} reloadList={ this.reloadList}/>
        </Modal>
      </div>
    )
  }
}

export default WhiteListRecord;