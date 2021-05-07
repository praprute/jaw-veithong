import React , {useEffect, useState} from "react"
import { 
  Row,
  Col,
  Card, 
  CardBody, 
  CardTitle, 
  CardSubtitle, 
  Button,
  Modal,
  ModalFooter
} from "reactstrap"
import { Link } from "react-router-dom"

import { API } from '../../configAPI'

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"
import "../Tables/datatables.scss"
import Moment from 'moment'
//get api
import {getAllOrder,
  readOrderById,
  Addtestreport, readTestResultlasted, 
  Recheck,WaitMicro,readFG,updateFG } from './api'
import { map, result } from "lodash";
import { orders } from "common/data";
import { isAuthenticated } from '../Authentication/api'

//SweetAlert
import SweetAlert from "react-bootstrap-sweetalert"

//store
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"
import { AddProductDetail, AddSpecificDetail, AddTestResultlasted, AddSpecificBioDetail} from 'store/actions'

const ModalTestReport = props => {

    const {isOpenTR, toggleTR, orders , spc, onAddTestResult, tr, bio} = props
    const {user, token} = isAuthenticated()
    const [success_msg, setsuccess_msg] = useState(false)
    const [success_recheck, setsuccess_recheck] = useState(false)
    const [success_micro,   setsuccess_micro  ] = useState(false)
    const [success_error, setsuccess_error] = useState(false)
    const [optionTR, setOptionTR] = useState(false)
    const [modal, setModal] = useState(false)
    const [dynamic_title, setdynamic_title] = useState("")
    const [dynamic_description, setdynamic_description] = useState("")
    const [detailById, setdetailById] = useState([{
        idOrderTested:"",
        BBE:"",
        PORD:"",
        ProductName:"",
        name:"",
        Size:"",
        Quantity:""
      }])
    
    const [resultChem , setresultChem] = useState(
      [
        { keyInput:"Tn"        ,int:false , key: "TN(g/L)", coa: false , val:null , temp:false },
        { keyInput:"Salt"      ,int:false , key: "%Salt(w/v)", coa: false , val:null , temp:false},
        { keyInput:"Histamine" ,int:false , key: "Histamine(ppm)", coa: false ,  val:null  , temp:false},
        { keyInput:"PH"        ,int:false , key: "PH", coa: false ,  val:null , temp:true},
        { keyInput:"Aw"        ,int:false , key: "Aw", coa: false ,  val:null   , temp:true},
        { keyInput:"Tss"       ,int:false , key: "Tss(Brix)", coa: false ,  val:null  , temp:true},
        { keyInput:"SPG"       ,int:false , key: "SPG", coa: false ,  val:null   , temp:true }
      ]
    ) 
    const [resultMicro , setresultMicro] = useState([
        { int: false, coa: false, val: "", key: 'APC' },
        { int: false, coa: false, val: "", key: 'Yeasts & Molds' },
        { int: false, coa: false, val: "", key: 'E. coil' },
        { int: false, coa: false, val: "", key: 'Coliform' },
        { int: false, coa: false, val: "", key: 'S. aureus' }
      ]) 

    const [values, setValues] = useState({})
    const [oldValues, setOldValues] = useState({})
      const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
        // console.log(values)
      }
      const [focusAfterClose, setFocusAfterClose] = useState(true);
      const fetchTestResultlasted = (token, idOrders) => {
        readTestResultlasted(token, idOrders).then(data => {
          // console.log(' readTestResultlasted :',data)
          if(data){
            if(data.success == 'success'){
              setValues({
                idOrders      :detailById.idOrders,
                PORD          :detailById.PORD,
                BBE           :detailById.BBE,
                PO            :detailById.PO,
                ProductName   :detailById.ProductName,
                Recheck       :detailById.Recheck,
                Size          :detailById.Size,
                Quantity      :detailById.Quantity,
                idSpfChem     :detailById.idPdSpecificChem,
                Tn            :null,
                PH            :null,
                Salt          :null,
                Tss           :null,
                Histamine     :null,
                SPG           :null,
                Aw            :null,
                idSpfMicro    :1,
                APC           :null,
                Yeasts        :null,
                EColi         :null,
                Coliform      :null,
                Saureus       :null,
                TempPH        :null,
                TempAW        :null,
                TempTSS       :null,
                TempSPG       :null,
              })
              if(!data.message){
                // setTRLasted({})
                // onAddTestResult({})
                setsuccess_error(true)
              }else{
                // setTRLasted(data.resulted)
                onAddTestResult(data.resulted)
                setsuccess_msg(true) 
                setdynamic_title("Tested Success")
                setdynamic_description("Order has been tested")
              }
            }else{
              // setTRLasted({})
              setsuccess_error(true)
              setdynamic_title("Server Problem")
              setdynamic_description("Server has break down!")
              onAddTestResult({})
            }
          }else{
            return null
          }
        })
      }

      function countDailyFinishgood(){
        let Tn = 0
        let PH = 0
        let Salt = 0
        let Tss = 0
        let Histamine = 0
        let SPG = 0
        let Aw = 0
        // console.log('ch function : ' , oldValues.Tn + "---" + values.Tn)

        if(oldValues.Tn == values.Tn){
          Tn = Tn
        }else{
          Tn = Tn+1
        }
        if(oldValues.PH == values.PH){
          PH = PH
        }else{
          PH = PH+1
        }
        if(oldValues.Salt == values.Salt){
          Salt = Salt
        }else{
          Salt = Salt+1
        }
        if(oldValues.Tss == values.Tss){
          Tss = Tss
        }else{
          Tss = Tss+1
        }
        if(oldValues.Histamine == values.Histamine){
          Histamine = Histamine
        }else{
          Histamine = Histamine+1
        }
        if(oldValues.SPG == values.SPG){
          SPG = SPG
        }else{
          SPG = SPG+1
        }
        if(oldValues.Aw == values.Aw){
          Aw = Aw
        }else{
          Aw = Aw+1
        }

        // console.log('Tn : ' , Tn)
        // console.log('PH : ' , PH)
        // console.log('Salt : ' , Salt)
        // console.log('Tss : ' , Tss)
        // console.log('Histamine : ' , Histamine)
        // console.log('SPG : ' , SPG)
        // console.log('Aw : ' , Aw)

        var index = {
          Tn: Tn ,
          PH: PH,
          Salt: Salt ,
          Tss: Tss,
          Histamine: Histamine ,
          SPG: SPG,
          Aw: Aw,
        }

        // console.log('index update FG : ', index)
        updateFG(token,index).then(data => {
          if(data){
            // console.log('updateFG : ', data)
          }
        })
      }

      const handleTest = event => {
        event.preventDefault()
        // console.log('values test : ' , values)
        var index = 
        {
          idOrders: values.idOrders,
          Recheck: parseInt(values.Recheck),
          idSpfChem: parseInt(values.idSpfChem) ,
          Tn: values.Tn ,
          PH: values.PH ,
          Salt: values.Salt ,
          Tss: values.Tss ,
          Histamine: values.Histamine ,
          SPG: values.SPG ,
          Aw: values.Aw ,
          idSpfMicro: parseInt(values.idSpfMicro)  ,
          APC: parseInt(values.APC) ,
          Yeasts: parseInt(values.Yeasts) ,
          EColi: parseInt(values.EColi) ,
          Coliform: parseInt(values.Coliform) ,
          Saureus: parseInt(values.Saureus) ,
          TempPH: values.TempPH ,
          TempAW: values.TempAW ,
          TempTSS: values.TempTSS ,
          TempSPG: values.TempSPG 
        }
        
        // console.log('value test :',index )
        Addtestreport(token, index).then(data => {
          if(data){
            // console.log('test data : ', data)
            fetchTestResultlasted(token , values.idOrders)
            countDailyFinishgood()
          }
        })
      }

      const handleRecheck = (event) => {
        event.preventDefault();
        // console.log('values.Recheck : ',values.Recheck)
        var index = {
          idOrders: values.idOrders,
          Recheck : values.Recheck
        }
        Recheck(token, index).then(data => {
          if(data){
            if(data.success == "success"){
              setsuccess_recheck(true)
              setdynamic_title("Send Recheck Success")
              setdynamic_description("Order has been rechecking")
            }else{
              setsuccess_error(true)
              setdynamic_title("Send Recheck Error")
              setdynamic_description("Order has been rechecking error !")
            }
          }else{
            setsuccess_error(true)
            setdynamic_title("Server Problem")
            setdynamic_description("Server has break down!")
          }
        })
      }

      const handleWaitMicro = (event) => {
        event.preventDefault();
        // console.log('values.Recheck : ',values.Recheck)
        var index = {
          idOrders: values.idOrders,
        }
        WaitMicro(token, index).then(data => {
          if(data){
            if(data.success == "success"){
              setsuccess_micro(true)
              setdynamic_title("Change Status Success")
              setdynamic_description("Change Status => Wait to microbiological")
            }else{
              setsuccess_error(true)
              setdynamic_title("Change Status Error")
              setdynamic_description("Change Status => Wait to microbiological Error")
            }
          }else{
            setsuccess_error(true)
            setdynamic_title("Server Problem")
            setdynamic_description("Server has break down!")
          }
        })
      }

      useEffect(() => {
        var current_datetime = new Date()
        let formatted_date_now = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + (current_datetime.getDate())
        //let formatted_DateTime_now = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + (current_datetime.getDate())+"T"+current_datetime.getHours()+":"+current_datetime.getMinutes()+":"+current_datetime.getSeconds()
        // console.log('formatted_date_now : ' , formatted_date_now)
        readFG(token).then(data => {
          if(data){
            // console.log('readFG : ', data)
            if(data.success == 'success' && data.message.length > 0){
              // setOldValues({
              //   Tn            :data.message[0].TN,
              //   PH            :data.message[0].PH,
              //   Salt          :data.message[0].SALT,
              //   Tss           :data.message[0].TSS,
              //   Histamine     :data.message[0].HISTAMINE,
              //   SPG           :data.message[0].SPG,
              //   Aw            :data.message[0].AW,
              //   })
            }
          }
        })
      }, [])

      useEffect(() => {
        // if(toggleTR){
        //  window.location.reload()
        // }
      }, [])

      useEffect(() => {
        // setTRLasted(tr)
        setdetailById(orders)
        // console.log('order : ', orders)
    },[orders,bio,tr]) 
    useEffect(() => {
        console.log('test props : ',isOpenTR )
    }, [isOpenTR])
    useEffect(() => {

        if(tr[0] != undefined){
          // console.log('tr[0] : ',tr[0])
            setresultChem(tr[0])
            setresultMicro(tr[1])
            setValues({
              idOrders      :detailById.idOrders,
              PORD          :detailById.PORD,
              BBE           :detailById.BBE,
              PO            :detailById.PO,
              ProductName   :detailById.ProductName,
              Recheck       :detailById.Recheck,
              Size          :detailById.Size,
              Quantity      :detailById.Quantity,
              idSpfChem     :detailById.idPdSpecificChem,
              Tn            :tr[0][0].val,
              PH            :tr[0][3].val,
              Salt          :tr[0][1].val,
              Tss           :tr[0][5].val,
              Histamine     :tr[0][2].val,
              SPG           :tr[0][6].val,
              Aw            :tr[0][4].val,
              idSpfMicro    :1,
              APC           :tr[1][0].val,
              Yeasts        :tr[1][1].val,
              EColi         :tr[1][2].val,
              Coliform      :tr[1][3].val,
              Saureus       :tr[1][4].val,
              TempPH        :tr[0][3].temp,
              TempAW        :tr[0][4].temp,
              TempTSS       :tr[0][5].temp,
              TempSPG       :tr[0][6].temp,
              })
              setOldValues({
                Tn            :tr[0][0].val,
                PH            :tr[0][3].val,
                Salt          :tr[0][1].val,
                Tss           :tr[0][5].val,
                Histamine     :tr[0][2].val,
                SPG           :tr[0][6].val,
                Aw            :tr[0][4].val,
                })
            
        }else{
            setresultChem([
                { keyInput:"Tn"        ,int:false , key: "TN(g/L)", coa: false , val:"" , temp:false },
                { keyInput:"Salt"      ,int:false , key: "%Salt(w/v)", coa: false , val:"" , temp:false},
                { keyInput:"Histamine" ,int:false , key: "Histamine(ppm)", coa: false ,  val:""  , temp:false},
                { keyInput:"PH"        ,int:false , key: "PH", coa: false ,  val:"" , temp:true},
                { keyInput:"Aw"        ,int:false , key: "Aw", coa: false ,  val:""   , temp:true},
                { keyInput:"Tss"       ,int:false , key: "Tss(Brix)", coa: false ,  val:""  , temp:true},
                { keyInput:"SPG"       ,int:false , key: "SPG", coa: false ,  val:""   , temp:true }
              ])
              setresultMicro([
                { int: false, coa: false, val: "", key: 'APC' },
                { int: false, coa: false, val: "", key: 'Yeasts & Molds' },
                { int: false, coa: false, val: "", key: 'E. coil' },
                { int: false, coa: false, val: "", key: 'Coliform' },
                { int: false, coa: false, val: "", key: 'S. aureus' }
              ])
              setValues({
                idOrders      :detailById.idOrders,
                PORD          :detailById.PORD,
                BBE           :detailById.BBE,
                PO            :detailById.PO,
                ProductName   :detailById.ProductName,
                Recheck       :detailById.Recheck,
                Size          :detailById.Size,
                Quantity      :detailById.Quantity,
                idSpfChem     :detailById.idPdSpecificChem,
                Tn            :null,
                PH            :null,
                Salt          :null,
                Tss           :null,
                Histamine     :null,
                SPG           :null,
                Aw            :null,
                idSpfMicro    :1,
                APC           :null,
                Yeasts        :null,
                EColi         :null,
                Coliform      :null,
                Saureus       :null,
                TempPH        :null,
                TempAW        :null,
                TempTSS       :null,
                TempSPG       :null,
                })
        }
    }, [tr])

    return(
                    <Modal
                      
                      isOpen={isOpenTR}
                      // toggle={toggleTR}
                      centered={true}
                      // dialogClassName="modal-90w"
                      size="xl"
                      // returnFocusAfterClose
                    >
                    {success_recheck ? (
                    <SweetAlert
                      title={dynamic_title}
                      success
                    //   showCancel
                      confirmBtnBsStyle="success"
                    //   cancelBtnBsStyle="danger"
                      onConfirm={() => {
                        location.reload();
                      }}
                    >
                      {dynamic_description}
                    </SweetAlert>
                  ) : null}
                  {success_micro ? (
                    <SweetAlert
                      title={dynamic_title}
                      success
                    //   showCancel
                      confirmBtnBsStyle="success"
                    //   cancelBtnBsStyle="danger"
                      onConfirm={() => {
                        location.reload();
                      }}
                    >
                      {dynamic_description}
                    </SweetAlert>
                  ) : null}

                      {success_msg ? (
                    <SweetAlert
                      title={dynamic_title}
                      success
                    //   showCancel
                      confirmBtnBsStyle="success"
                    //   cancelBtnBsStyle="danger"
                      onConfirm={() => {
                        setsuccess_msg(false)
                        setOptionTR(true)
                      }}
                    >
                      {dynamic_description}
                    </SweetAlert>
                  ) : null}

                    {success_error ? (
                    <SweetAlert
                      title={dynamic_title}
                      danger
                    //   showCancel
                      confirmBtnBsStyle="danger"
                    //   cancelBtnBsStyle="danger"
                      onConfirm={() => {
                        setsuccess_error(false)
                      }}
                    >
                      {dynamic_description}
                    </SweetAlert>
                  ) : null}

                      <div className="modal-header">
                        <h3 className="modal-title mt-0">Order Test Result : {detailById.PO}
                        </h3>
                        {/* <button
                          type="button"
                          onClick={toggleTR}
                          className="close"
                          data-dismiss="modal"
                          aria-label="Close"
                        >
                          <span aria-hidden="true">&times;</span>
                        </button> */}
                      </div>
                      <div className="modal-body">

                          {/* Header TestResult */}

                          {/* idOrderTested:orders.idOrders,
          BBE:orders.BBE,
          PORD:orders.PORD,
          PO:orders.PO,
          ProductName:orders.ProductName,
          Size:orders.Size,
          Quantity:orders.Quantity */}
                        <Row>
                          <Col md="6" xs="12" style={{display:'flex', alignItems:'center', marginBottom:'10px'}}>
                            <div style={{paddingLeft:'10%',paddingRight:'10%'  ,display:'flex', width:'100%', alignItems:'center', justifyContent:'center'}}>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-start'}}>
                                <h5 style={{margin:'0'}}>LOT</h5>
                              </div>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-end'}}>
                              <span>PORD: {Moment(detailById.PORD).format('DD/MM/YYYY')}<br/>BBE    : {Moment(detailById.PORD).format('DD/MM/YYYY')}</span>
                              </div>
                            </div>
                          </Col>
                
                          <Col md="6" xs="12" style={{display:'flex', alignItems:'center', marginBottom:'10px'}}>
                          <div style={{paddingLeft:'10%',paddingRight:'10%'  ,display:'flex', width:'100%', alignItems:'center', justifyContent:'center'}}>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-start'}}>
                                <h5 style={{margin:'0'}}>Order Numder</h5>
                              </div>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-end'}}>
                              <span>{detailById.PO}</span>
                              </div>
                            </div>
                          </Col>

                          <Col md="6" xs="12" style={{display:'flex', alignItems:'center', marginBottom:'10px'}}>
                          <div style={{paddingLeft:'10%',paddingRight:'10%'  ,display:'flex', width:'100%', alignItems:'center', justifyContent:'center'}}>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-start'}}>
                                <h5 style={{margin:'0'}}>Product Name</h5>
                              </div>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-end'}}>
                              <span>{detailById.ProductName}</span>
                              </div>
                            </div>
                          </Col>

                          <Col md="6" xs="12"  style={{display:'flex', alignItems:'center', marginBottom:'10px'}}>
                          <div style={{paddingLeft:'10%',paddingRight:'10%'  ,display:'flex', width:'100%', alignItems:'center', justifyContent:'center'}}>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-start'}}>
                                <h5 style={{margin:'0'}}>Pack Size</h5>
                              </div>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-end'}}>
                              <span>{detailById.Size}</span>
                              </div>
                            </div>
                          </Col>

                          <Col md="6" xs="12" style={{display:'flex', alignItems:'center', marginBottom:'10px'}}>
                          <div style={{paddingLeft:'10%',paddingRight:'10%'  ,display:'flex', width:'100%', alignItems:'center', justifyContent:'center'}}>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-start'}}>
                                <h5 style={{margin:'0'}}>Quantity</h5>
                              </div>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-end'}}>
                              <span>{detailById.Quantity}</span>
                              </div>
                            </div>
                          </Col>
                          <Col md="6" xs="12" style={{display:'flex', alignItems:'center', marginBottom:'10px'}}>
                          <div style={{paddingLeft:'10%',paddingRight:'10%'  ,display:'flex', width:'100%', alignItems:'center', justifyContent:'center'}}>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-start'}}>
                                <h5 style={{margin:'0'}}>Specific</h5>
                              </div>
                              <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'flex-end'}}>
                              <span>{detailById.name}</span>
                              </div>
                            </div>
                          </Col>
                        </Row>

                        <hr/>
                        {/* Chemical analysis */}
                        <Row>
                            <Col xs="12" style={{border:'solid 1px #989a9b', borderRadius:'10px',
                                height:'100%', background:'transparent', display:'flex', flexDirection:'column',
                                justifyContent:'center', alignItems:'center',padding:'10px'
                            }}>
                                <h5 style={{borderBottom:'solid 1px #989a9b'}}>Chemical analysis</h5>
                                <Row style={{display:'flex', width:'100%'}}>
                                    <Col xs="3">
                                <div>
                                    <Col xs="12">
                                    <h6>{" "}</h6>
                                    </Col>
                                    
                                </div>
                                </Col>
                                <Col xs="3">
                                <div>
                                    <h6>Result</h6>
                                </div>
                                </Col>
                                <Col xs="3">
                                <div>
                                    <h6>Temp C &deg; </h6>
                                </div>
                                </Col>
                                <Col xs="3" style={{display:'flex'}}>
                                <Col xs="6">
                                    <h6>Int. spec</h6>
                                </Col>
            
                                <Col xs="6">
                                    <h6>COA spec</h6>
                                </Col>
                                </Col>
                                </Row>

                              

                                {resultChem.map((index, key) => (
                                        
                                <Row style={{display:'flex', width:'100%', alignItems:'center'}}>
                                    <Col xs="3">
                                <div>
                                    <Col xs="12" style={{display:'flex', justifyContent:'flex-start', paddingLeft:'30%'}}>
                                    <h6 style={{margin:'0'}}>{index.key}</h6>
                                    </Col>
                                </div>
                                </Col>
                                <Col xs="3">
                                <Row  className="mb-1">
                                        <div className="col-md-10">
                                          <input
                                            className="form-control"
                                            type="number"
                                            name={index.keyInput}
                                            onChange={handleChange(`${index.keyInput}`)}
                                            // value={index.val}
                                            placeholder={index.val}
                                          />
                                        </div>
                                </Row>
                                
                                </Col>
                                <Col xs="3">
                                  {index.tkTemp ? (
                                    // <div>
                                    // <h6>{index.temp}</h6>
                                    // </div>
                                    <Row  className="mb-1">
                                    <div className="col-md-10">
                                      <input
                                        className="form-control"
                                        type="number"
                                        name={index.keyTemp}
                                        onChange={handleChange(`${index.keyTemp}`)}
                                        // value={index.temp}
                                        placeholder={index.temp}
                                      />
                                    </div>
                            </Row>
                                  ) : (
                                    null
                                  )}
                                
                                </Col>
                                <Col xs="3" style={{display:'flex'}}>
                                <Col xs="6">
                                    {index.int ? (
                                        <div className="badge bg-success font-size-13">
                                            <span>PASS</span>
                                        </div>
                                    ) : (
                                        <div className="badge bg-danger font-size-13">
                                        <span>FAIL</span>
                                        </div>
                                    )}
                                </Col>
            
                                <Col xs="6">
                                {index.coa ? (
                                        <div className="badge bg-success font-size-13">
                                            <span>PASS</span>
                                        </div>
                                    ) : (
                                        <div className="badge bg-danger font-size-13">
                                        <span>FAIL</span>
                                        </div>
                                    )}
                                </Col>
                                </Col>
                                </Row>
                                    ))}

                            </Col>
                        </Row>
                        <br/>

                        {/* Microbiological analysis */}
                        <Row>
                            <Col xs="12" style={{border:'solid 1px #989a9b', borderRadius:'10px',
                                height:'100%', background:'transparent', display:'flex', flexDirection:'column',
                                justifyContent:'center', alignItems:'center',padding:'10px'
                            }}>
                                <h5 style={{borderBottom:'solid 1px #989a9b'}}>Microbiological analysis</h5>
                                <Row style={{display:'flex', width:'100%'}}>
                                    <Col xs="3">
                                <div>
                                    <Col xs="12">
                                    <h6>{" "}</h6>
                                    </Col>
                                    
                                </div>
                                </Col>
                                <Col xs="3">
                                <div>
                                    <h6>Result</h6>
                                </div>
                                </Col>
                                <Col xs="3">
                                <div>
                                    <h6>Temp C &deg; </h6>
                                </div>
                                </Col>
                                <Col xs="3" style={{display:'flex'}}>
                                <Col xs="6">
                                    <h6>Int. spec</h6>
                                </Col>
            
                                <Col xs="6">
                                    <h6>COA spec</h6>
                                </Col>
                                </Col>
                                </Row>

                                {resultMicro.map((index, key) => (
                                        // <div>{JSON.stringify(index)}</div>
                                <Row style={{display:'flex', width:'100%'}}>
                                    <Col xs="3">
                                <div>
                                    <Col xs="12" style={{display:'flex', justifyContent:'flex-start', paddingLeft:'30%'}}>
                                    <h6>{index.key}</h6>
                                    {/* <div>{JSON.stringify(index)}</div> */}
                                    </Col>
                                </div>
                                </Col>
                                <Col xs="3">
                                <Row  className="mb-1">
                                        <div className="col-md-10">
                                          <input
                                            className="form-control"
                                            type="number"
                                            name={index.keyInput}
                                            onChange={handleChange(`${index.keyInput}`)}
                                            // value={index.val}
                                            placeholder={index.val}
                                          />
                                        </div>
                                </Row>
                                </Col>
                                <Col xs="3">
                                <div>
                                    <h6>{" "}</h6>
                                </div>
                                </Col>
                                <Col xs="3" style={{display:'flex'}}>
                                <Col xs="6">
                                    {index.int ? (
                                        <div className="badge bg-success font-size-13">
                                            <span>PASS</span>
                                        </div>
                                    ) : (
                                        <div className="badge bg-danger font-size-13">
                                        <span>FAIL</span>
                                        </div>
                                    )}
                                </Col>
            
                                <Col xs="6">
                                {index.coa ? (
                                        <div className="badge bg-success font-size-13">
                                            <span>PASS</span>
                                        </div>
                                    ) : (
                                        <div className="badge bg-danger font-size-13">
                                        <span>FAIL</span>
                                        </div>
                                    )}
                                </Col>
                                </Col>
                                </Row>
                                    ))}
                            </Col>
                        </Row>
                        
                      
                      </div>
                      {optionTR ? (
                        <ModalFooter  style={{width:'100%',display:'flex', alignItems: 'center'}}>
                          <Row style={{width:'100%',display:'flex', alignItems: 'center'}}>
                            <Col xs="12" md="8" style={{display:'flex', alignItems: 'center', justifyContent:'flex-start'}}>
                        <Button color="warning" className="w-lg" onClick={(event) => {
                          // toggleTR()
                          handleRecheck(event)
                        }}>Recheck</Button>&nbsp;&nbsp;
                        <Button color="primary" className="w-lg" onClick={(event) => {
                          // toggleTR()
                          // handleRecheck(event)
                          handleWaitMicro(event)
                        }}>Wait to microbiological</Button>&nbsp;&nbsp;
                        </Col>
                        <Col  xs="12" md="4" style={{display:'flex', alignItems: 'center', justifyContent:'flex-end'}}>
                        <Button color="primary" className="w-lg" onClick={toggleTR}>Save</Button>&nbsp;&nbsp;
                        <Button color="danger" className="w-lg" onClick={() => {
                          toggleTR()
                          setOptionTR(false)
                          window.location.reload()
                        }}>Canel</Button>
                        </Col>
                          </Row>
                        
                      </ModalFooter>
                        ) : (
                          <ModalFooter>
                        
                          <Button color="primary" className="w-lg" onClick={(event) => {
                            // toggleTR()
                            handleTest(event)
                          }}>TEST</Button>{' '}
                          <Button color="danger" className="w-lg" onClick={(event) => {
                            toggleTR()
                            setOptionTR(false)
                          }}>Cancel</Button>
                        </ModalFooter>
                        )}
                      
                    </Modal>   
    )
}

ModalTestReport.propTypes = {
    orders: PropTypes.array,
    spc: PropTypes.array,
    tr: PropTypes.array,
    bio: PropTypes.array
  }
  
  const mapStateToProps = state => ({
    orders: state.DetailOrder.Detail,
    spc: state.DetailOrder.SpecificChem,
    tr: state.DetailOrder.TestResultLasted,
    bio:  state.DetailOrder.SpecificBio,
  })

  const mapDispatchToProps = dispatch => ({
    onAddDetail: (detail) => dispatch(AddProductDetail(detail)),
    onAddSpcChem: (detailSpcChem) => dispatch(AddSpecificDetail(detailSpcChem)),
    onAddTestResult: (detailSpcChem) => dispatch(AddTestResultlasted(detailSpcChem)),
    onAddSpcBio: (detailSpcChem) => dispatch(AddSpecificBioDetail(detailSpcChem)),
  })

  export default connect(mapStateToProps,mapDispatchToProps)(withRouter(ModalTestReport))