import{m as _,B as T,H as w,J as v,P as h,W as f,R as C,C as y,n as S}from"./index-f28d7425.js";import{l as R,m as b,q as x}from"./vuetify-f4a6879d.js";import"./overlayscrollbars-44d87bcf.js";import"./echarts-ff51454d.js";var P=Object.defineProperty,U=Object.getOwnPropertyDescriptor,d=(a,t,e,s)=>{for(var i=s>1?void 0:s?U(t,e):t,r=a.length-1,o;r>=0;r--)(o=a[r])&&(i=(s?o(t,e,i):o(i))||i);return s&&i&&P(t,e,i),i};let l=class extends _(T,w){constructor(){super(...arguments),this.capitalize=v,this.pc=null,this.restartTimeout=null,this.status="connecting",this.eTag=null,this.sessionUuid=null,this.queuedCandidates=[],this.offerData={iceUfrag:"",icePwd:"",medias:[]},this.RESTART_PAUSE=2e3,this.unquoteCredential=t=>JSON.parse('"'.concat(t,'"'))}beforeDestroy(){this.terminate(),this.restartTimeout&&clearTimeout(this.restartTimeout)}get webcamStyle(){var t,e,s;return{transform:this.generateTransform((t=this.camSettings.flip_horizontal)!=null?t:!1,(e=this.camSettings.flip_vertical)!=null?e:!1,(s=this.camSettings.rotation)!=null?s:0)}}get url(){let t=this.camSettings.stream_url;return t.endsWith("/")||(t+="/"),t+="whep",this.convertUrl(t,this.printerUrl)}changedUrl(){this.terminate(),this.start()}get expanded(){var t;return this.page!=="dashboard"?!0:(t=this.$store.getters["gui/getPanelExpand"]("webcam-panel",this.viewport))!=null?t:!1}expandChanged(t){if(!t){this.terminate();return}this.start()}log(t,e){if(e){window.console.log("[WebRTC mediamtx] ".concat(t),e);return}window.console.log("[WebRTC mediamtx] ".concat(t))}linkToIceServers(t){return t===null?[]:t.split(", ").map(e=>{const s=e.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i);if(s===null)return{urls:""};const i={urls:[s[1]]};return s.length>3&&(i.username=this.unquoteCredential(s[3]),i.credential=this.unquoteCredential(s[4]),i.credentialType="password"),i})}parseOffer(t){const e={iceUfrag:"",icePwd:"",medias:[]};for(const s of t.split("\r\n"))s.startsWith("m=")?e.medias.push(s.slice(2)):e.iceUfrag===""&&s.startsWith("a=ice-ufrag:")?e.iceUfrag=s.slice(12):e.icePwd===""&&s.startsWith("a=ice-pwd:")&&(e.icePwd=s.slice(10));return e}generateSdpFragment(t,e){const s={};for(const o of e){const c=o.sdpMLineIndex;c!==null&&(c in s||(s[c]=[]),s[c].push(o))}let i="a=ice-ufrag:"+t.iceUfrag+"\r\na=ice-pwd:"+t.icePwd+"\r\n",r=0;for(const o of t.medias){if(s[r]!==void 0){i+="m="+o+"\r\na=mid:"+r+"\r\n";for(const c of s[r])i+="a="+c.candidate+"\r\n"}r++}return i}async start(){if(this.restartTimeout!==null&&(clearTimeout(this.restartTimeout),this.restartTimeout=null),this.url===null){this.log("invalid url"),this.scheduleRestart();return}this.log("requesting ICE servers from "+this.url);try{const t=await fetch(this.url,{method:"OPTIONS"});if(t.status!==204){this.log("error: Received bad status code:",t.status),this.scheduleRestart();return}await this.onIceServers(t)}catch{this.log("error: Cannot connect to backend"),this.scheduleRestart()}}async onIceServers(t){const e=this.linkToIceServers(t.headers.get("Link"));this.log("ice servers:",e),this.pc=new RTCPeerConnection({iceServers:e,sdpSemantics:"unified-plan"});const s="sendrecv";this.pc.addTransceiver("video",{direction:s}),this.pc.addTransceiver("audio",{direction:s}),this.pc.onicecandidate=r=>this.onLocalCandidate(r),this.pc.oniceconnectionstatechange=()=>this.onConnectionState(),this.pc.ontrack=r=>{this.log("new track:",r.track.kind),this.video.srcObject=r.streams[0]};const i=await this.pc.createOffer();await this.onLocalOffer(i)}async onLocalOffer(t){var e,s,i,r,o,c,p;try{const n=await fetch((e=this.url)!=null?e:"",{method:"POST",headers:{"Content-Type":"application/sdp"},body:t.sdp});if(n.status!==201){this.log("error: Received bad status code:",n.status),this.scheduleRestart();return}this.offerData=this.parseOffer((s=t.sdp)!=null?s:""),(i=this.pc)==null||i.setLocalDescription(t),this.eTag=n.headers.get("ETag");const u=(r=n.headers.get("Location"))!=null?r:"";this.sessionUuid=(o=u==null?void 0:u.substring(u.lastIndexOf("/")+1))!=null?o:null,n.headers.has("E-Tag")&&(this.eTag=n.headers.get("E-Tag"));const g=await n.text();this.onRemoteAnswer(new RTCSessionDescription({type:"answer",sdp:g}))}catch(n){this.log((p=(c=n==null?void 0:n.message)!=null?c:n)!=null?p:"unknown error"),this.scheduleRestart()}}onRemoteAnswer(t){var e;if(this.restartTimeout===null){try{(e=this.pc)==null||e.setRemoteDescription(t)}catch(s){this.log(s),this.scheduleRestart()}this.queuedCandidates.length!==0&&(this.sendLocalCandidates(this.queuedCandidates),this.queuedCandidates=[])}}onConnectionState(){var t,e;if(this.restartTimeout===null)switch(this.status=(e=(t=this.pc)==null?void 0:t.iceConnectionState)!=null?e:"",this.log("peer connection state:",this.status),this.status){case"disconnected":this.scheduleRestart()}}onLocalCandidate(t){if(this.restartTimeout===null&&t.candidate!==null){if(this.eTag===""){this.queuedCandidates.push(t.candidate);return}this.sendLocalCandidates([t.candidate])}}async sendLocalCandidates(t){var s;if(this.sessionUuid===null){this.log("Session-UUID is null"),this.scheduleRestart();return}const e=((s=this.url)!=null?s:"")+"/"+this.sessionUuid;try{const i=await fetch(e,{method:"PATCH",headers:{"Content-Type":"application/trickle-ice-sdpfrag","If-Match":this.eTag},body:this.generateSdpFragment(this.offerData,t)});if(i.status===204)return;if(i.status===404){this.log("stream not found"),this.scheduleRestart();return}this.log("bad status code ".concat(i.status)),this.scheduleRestart()}catch(i){this.log(i),this.scheduleRestart()}}terminate(){this.log("terminating"),this.pc!==null&&(this.pc.close(),this.pc=null)}scheduleRestart(){this.restartTimeout===null&&(this.terminate(),this.restartTimeout=window.setTimeout(()=>{this.log("scheduling restart"),this.restartTimeout=null,this.start()},this.RESTART_PAUSE),this.eTag="",this.queuedCandidates=[])}};d([h({required:!0})],l.prototype,"camSettings",2);d([h({default:null})],l.prototype,"printerUrl",2);d([h({type:String,default:null})],l.prototype,"page",2);d([C()],l.prototype,"video",2);d([f("url")],l.prototype,"changedUrl",1);d([f("expanded",{immediate:!0})],l.prototype,"expandChanged",1);l=d([y],l);var O=function(){var a=this,t=a.$createElement,e=a._self._c||t;return e("div",[e("video",{directives:[{name:"show",rawName:"v-show",value:a.status==="connected",expression:"status === 'connected'"}],ref:"video",staticClass:"webcamImage",style:a.webcamStyle,attrs:{autoplay:"",playsinline:"",muted:""},domProps:{muted:!0}}),a.status!=="connected"?e(R,[e(b,{staticClass:"_webcam_webrtc_output text-center d-flex flex-column justify-center align-center"},[a.status==="connecting"?e(x,{staticClass:"mb-3",attrs:{indeterminate:"",color:"primary"}}):a._e(),e("span",{staticClass:"mt-3"},[a._v(a._s(a.capitalize(a.status)))])],1)],1):a._e()],1)},M=[];const m={};var W=S(l,O,M,!1,q,"ae35d12c",null,null);function q(a){for(let t in m)this[t]=m[t]}const $=function(){return W.exports}();export{$ as default};
