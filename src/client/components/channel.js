import { ChannelFactory} from 'real-value-channel-socketio-client-buffered/src/lib'
import { getSocketUrl } from '../config'

let serverUrl = getSocketUrl()

let channelFactoryServer = ChannelFactory({url: serverUrl})

export const channelActivity = channelFactoryServer('activity')

export const channelProduction = channelFactoryServer('production')
export const channelAsset = channelFactoryServer('asset')
export const channelTarget = channelFactoryServer('target')
