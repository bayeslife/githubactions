import React, { useState, useEffect } from 'react'
import Sidebar from "react-sidebar";
import { withRouter, Link } from "react-router-dom";
import { Navbar, Sidebar as SidebarContent, SidebarButton } from '@aurecon/design'

let reports = [{id: 1,title:"Report 1",route:"/reports/1"}]
let processes = [{id: 2,title:"Process 1",route:"/process/1"}]

function useWindowWidth() {
	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth);
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	return width;
}

const Layout = (props) => {
	const [sidebarOpen, onSetSidebarOpen] = React.useState(true);
	const width = useWindowWidth();


	let theproject = "real-value-full-stack"

	return (
		<div>
			<Navbar
				title={<a href="/">{theproject}</a>}
				isDark={true}
				sidebarCallback={() => { onSetSidebarOpen(!sidebarOpen) }}
				accountActions={<a href="{REACT_APP_BACKEND_URL}/logout"><i className="fas fa-sign-out-alt"></i></a>}
				profilePic={"https://yt3.ggpht.com/a/AGF-l7-ICHsd9JVpIsrIGh6-qDXhjB86EKXFUq6dPA=s900-c-k-c0xffffffff-no-rj-mo"}
			/>
			<Sidebar
				open={sidebarOpen}
				docked={width > 960 && sidebarOpen}
				sidebarClassName="sidebar"
				onSetOpen={onSetSidebarOpen}
				styles={{ sidebar: { position: 'absolute', paddingTop: '52px', background: "white" }, content: { marginTop: '52px' } }}
				sidebar={
							<SidebarContent isDark={true}>
								<>
									<Link
										style={{ textDecoration: 'none', marginLeft: "10px", marginTop: "10px", color: "white" }}
										to={`/`}
									>
										<b>Processes</b>
									</Link>
									<div style={{ minHeight: '100px' }}>
										{
											processes.map(({ id, title, route }) => (
												<SidebarButton
													key={id}
													isDark={true}
													label={title}
													isSecondary={true}
													href={route}
												>
												</SidebarButton>
											))
										}
									</div>
									<Link
										style={{ textDecoration: 'none', marginLeft: "10px", marginTop: "10px", color: "white" }}
										to={`/`}
									>
										<b>Reports</b>
										</Link>
										<div style={{ minHeight: '100px' }}>
										{
											reports.map(({ id, title, route }) => (
												<SidebarButton
													key={id}
													isDark={true}
													label={title}
													isSecondary={true}
													href={route}
												>
												</SidebarButton>
											))
										}
									</div>
								</>
							</SidebarContent>
						}
			>
				{props.children}
			</Sidebar>
		</div >
	)
}

export default withRouter(Layout)
