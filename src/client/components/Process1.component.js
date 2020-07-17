import React, {useState, useEffect} from 'react';
import { Button , Table, Dialogue} from '@aurecon/design'
import Uppy from '@uppy/core'
import { DashboardModal } from '@uppy/react'
import XHRUpload from '@uppy/xhr-upload'
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { getAPI } from '../config'
import { NumericStyle, LabelStyle, TextStyle} from './style'
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { postJob, getFiles, deleteFile, publishJob} from '../models'
import { channelActivity} from './channel'

const listHeaders = [
    { name: 'Type', key: 'type' },
    { name: 'Name', key: 'name' },
    { name: 'Download', key: 'download' },
    { name: 'View', key: 'controls' }    
]

const uppyParams = {
    debug: true,
    meta: { type: 'avatar' },
    restrictions: {
        maxFileSize: Number.MAX_SAFE_INTEGER,
        allowedFileTypes: ['.csv'],
        minNumberOfFiles: 1
    },
}

export const Process1 = (props) => {
    const {jobId} = useParams()
    const  uppy = Uppy(uppyParams)
    const [ files,setFiles] = useState([])
    const [ currentWeek] = useState(jobId)
    const [confirmDelete,setConfirmDelete] = useState(false)
    const [selectedFile,setSelectedFile] = useState(null)
    
    uppy.use(XHRUpload, { endpoint: `/api/source/${currentWeek}` })

	uppy.on('complete', (result) => {
        getFiles(currentWeek).then((files)=>setFiles(files))
    })

    useEffect(()=>{
        getFiles(currentWeek).then((files)=>setFiles(files))
    },[currentWeek,setFiles])

    const selectFile= ((url) => {
        setSelectedFile(url)
    })

    const downloadSpan = (file)=>{
        return <a style={TextStyle} href={`${getAPI()}${file.url}`}>Download</a>
    }
    const iconSpan = (file) => {
        return <div>
            { confirmDelete && file.url===selectedFile && 
					<div className='popup'>  
						<div className='popup_inner' > 
							<Dialogue title="Do you want to remove this file?" label="Confirmation" >
							<Button onClick={async (e) => {e.preventDefault(); await deleteFile(selectedFile);handleDelete(selectedFile); }}> Delete</Button>
							<Button onClick={(e) => {e.preventDefault(); setConfirmDelete(false)}}> Cancel </Button>
							</Dialogue>
						</div>
					</div>
			}
            <span style={{ paddingRight: "10px" }}
                onClick={(e) => {
                    e.preventDefault();
                    setConfirmDelete(true)
                }}>
                <FontAwesomeIcon icon={faTrashAlt} />
            </span>
        </div >
    }

    function handleDelete(file){
        let filesWithoutDeleted = files.filter((f)=>f.url!==file)
        setFiles(filesWithoutDeleted)
        setConfirmDelete(false)
    }

    const [logContent,setLogContent] = useState('')
    useEffect(()=>{
        let monitor = true
        let content = ''
        async function processlog(){
            if(channelActivity.length()>0){
                while(channelActivity.length()>0){
                    content = `${content}\n${channelActivity.dequeue()}`
                }
                setLogContent(content)
            }
            if(monitor)
                setTimeout(processlog,1000)
        }
        processlog()
        return function cleanup(){
            monitor=false
        }
    },[setLogContent])

    return (<div>
        <div className='row'>
                <div className='column' style={{ width: '50%', float: 'left' }}>
                    <Button onClick={async (e) => {e.preventDefault(); setLogContent(''); postJob({currentWeek})}}>
                            Run Pipeline 
                    </Button>
                </div>
                <div className='column' style={{ width: '50%', float: 'left' }}>
                    <Button onClick={async (e) => {e.preventDefault(); setLogContent(''); publishJob({currentWeek})}}>
                        Post Process Pipeline
                    </Button>
                </div>
        </div>
        <div className='row'>
            <div className='column' style={{ width: '50%', float: 'left' }}>
                <label style={{ ...LabelStyle }}>Current Week</label>

                <input type='number'
                    style={{ ...NumericStyle }}
                    value={currentWeek}
                    disabled
                />

                <label style={{ ...LabelStyle }}>Upload Source Files</label>
                <DashboardModal
                    uppy={uppy}
                    inline={true}
                    height={200}
                    showLinkToFileUploadResult={false}
                    proudlyDisplayPoweredByUppy={false}
                    showProgressDetails={true}
                    metaFields={[{ id: 'name', name: 'Name', placeholder: 'file name' }]}
                    closeModalOnClickOutside
                    plugins={[]}
                />

                <label style={{ ...LabelStyle }}>Existing Files</label>

                {files &&
                    <Table
					rows={Object.values(files).map((f) => ({
                        key: f.url,
                        ...f,
                        download: downloadSpan(f),
                        controls: iconSpan(f)
					}))}
					isPaged={false}
                    headers={listHeaders}
					onRowSelected={selectFile}
			    />
              }

            </div>
            <div className='column'
                style={{ width: '50%', height: 1200,float: 'left' }}>
                <label style={{ ...LabelStyle }}>Pipeline Log</label>
                <pre>{logContent}</pre>
        </div>
    </div>
    </div>)
}