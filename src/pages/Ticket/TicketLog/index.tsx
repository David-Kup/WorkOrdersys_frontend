import React, {useEffect, useState} from 'react';
import { Steps, Spin } from 'antd';
import {getTicketFlowLogRequest} from "@/services/ticket";

import { SERVER_URL } from '../../../../config/API';

const { Step } = Steps;

export interface TicketLogType {
  ticketId: number
}

const TicketLog = (props: TicketLogType) => {
  console.log('ticketlog is redenderd')
  const [flowLogData, setFlogData] = useState([]);
  const [loading, setLoading]= useState(false);


  useEffect(()=>{
    fetchTicketLogData();
  },[props.ticketId])

  const fetchTicketLogData = async() => {
    setLoading(true);
    const result = await getTicketFlowLogRequest(props.ticketId);
    if (result.code === 0) {
      setFlogData(result.data.value);
    }
    setLoading(false);
  }

  return (
    <Spin spinning={loading}>
      <Steps direction="vertical" size="small" current={0}>

        {flowLogData.map(item => {
          if (item?.log_type == 0)
            return (<Step key={item.id} title={item.participant_info.participant_alias} description={`于 ${item.gmt_created} 在 "${item.state.state_name}" 状态下，执行了 "${item.transition.transition_name}", 意见: ${item.suggestion}`} />)
          else 
            return (<Step key={item.id} title={item.participant_info.participant_alias} description={<div><span>{`于 ${item.gmt_created} 在 "${item.state.state_name}" 状态下，执行了 "${item.transition.transition_name}"`}</span><br /><img src={`${SERVER_URL}/media/ticket_file/${item.suggestion}`} /></div>} />)
        }
        )}
      </Steps>  
    </Spin>
  )

}

export default TicketLog;
