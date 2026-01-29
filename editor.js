let blocks = [];
let activeId = null;

const editor = document.getElementById("editor");
const settings = document.getElementById("settings");
const recentList = document.getElementById("recentList");

loadTemplates();

function addBlock(type){
    blocks.push({
        id:Date.now(),
        type,
        content:
        type==="text"?"Edit text...":
        type==="button"?"Click Me":
        type==="image"?"Paste your link here!":"",
        styles:{}
    });
    renderEditor();
    saveTemplate();
}


function renderEditor(){
    editor.innerHTML="";
    blocks.forEach((block,index)=>{
        let div = document.createElement("div");
        div.className = "block";
        div.style.background = block.styles.background || "transparent";
        div.style.padding = block.styles.padding || "0px";

        if(block.id===activeId) div.classList.add("active");

        div.onclick=e=>{
        e.stopPropagation();
        selectBlock(block.id);
        };

        if(block.type==="text"){
            div.style.background = block.styles.background || "transparent";
            div.textContent=block.content;
            div.style.padding = block.styles.padding || "1px";
            div.style.textAlign=block.styles.align||"left";
            div.style.fontSize=block.styles.fontSize||"16px";
            div.style.color=block.styles.color||"#000";
        }

        if(block.type==="image"){
            let img=document.createElement("img");
            img.src=block.content;
            img.style.padding= block.styles.padding || "1px";
            img.style.background = block.styles.background || "transparent";
            img.style.width = block.styles.width || "300px";
            img.style.height = block.styles.height || "auto";
            img.style.maxWidth = "100%";
            img.style.display="block";
            img.style.margin=
                block.styles.align==="center"?"0 auto":
                block.styles.align==="right"?"0 0 0 auto":"0";
            div.appendChild(img);
        }

        if (block.type === "button") {
            div.style.textAlign = block.styles.align || "left";
            let btn = document.createElement("button");
            btn.textContent = block.content;
            btn.style.fontSize = block.styles.fontSize || "14px";
            btn.style.color = block.styles.color || "#ffffff";
            btn.style.background = block.styles.bgColor || "#2563eb";
            btn.style.border = "none";
            btn.style.padding = "8px 16px";
            btn.style.borderRadius = "6px";
            btn.style.cursor = "pointer";

            btn.onclick = (e) => e.preventDefault();
            div.appendChild(btn);
        }


        if(block.type==="divider"){
            div.innerHTML="<hr>";
        }

        let controls=document.createElement("div");
        controls.className="block-controls";
        controls.innerHTML=`
        <button onclick="moveBlock(${index},-1)">↑</button>
        <button onclick="moveBlock(${index},1)">↓</button>
        <button onclick="deleteBlock(${block.id})">✖</button>
        `;
        div.appendChild(controls);
        editor.appendChild(div);
    });
}

function selectBlock(id){
    activeId=id;
    let block=blocks.find(b=>b.id===id);

    settings.innerHTML=`
        <h3>${block.type} Settings</h3>

        <label>Content</label>
        <input value="${block.content}"
        onchange="updateContent(${id},this.value)">

        <label>Alignment</label>
        <div class="align-buttons">
            <button onclick="setAlign(${id},'left')">Left</button>
            <button onclick="setAlign(${id},'center')">Center</button>
            <button onclick="setAlign(${id},'right')">Right</button>
        </div>

        <label>Background</label>
        <input type="color"
        onchange="updateStyle(${id},'background',this.value)">
        <label>Padding</label>
        <input placeholder="10px"
        oninput="updateStyle(${id},'padding',this.value)">

        ${(block.type==="text"||block.type==="button")?`
        <label>Font Size</label>
        <input type="number"
            oninput="updateStyle(${id},'fontSize',this.value+'px')">

        <label>Text Color</label>
        <input type="color"
            onchange="updateStyle(${id},'color',this.value)">
        `:""}

        ${block.type==="button"?`
        <label>Button Link</label>
        <input
            placeholder="https://example.com"
            value="${block.styles.link || ''}"
            onchange="updateStyle(${id}, 'link', this.value)">

        <label>Button Background Color</label>
        <input type="color"
            value="${block.styles.bgColor || '#2563eb'}"
            onchange="updateStyle(${id}, 'bgColor', this.value)">
        `:""}


        ${block.type==="image"?`
        <label>Image Width (px or %)</label>
        <input
            placeholder="e.g. 300px or 100%"
            value="${block.styles.width || ''}"
            oninput="updateStyle(${id}, 'width', this.value)"
        >

        <label>Image Height (px or auto)</label>
        <input
            placeholder="e.g. 200px or auto"
            value="${block.styles.height || ''}"
            oninput="updateStyle(${id}, 'height', this.value)"
        >
        `:""}

    `;
}


function updateContent(id,val){
    blocks.find(b=>b.id===id).content=val;
    renderEditor();
    saveTemplate();
}

function updateStyle(id,key,val){
    blocks.find(b=>b.id===id).styles[key]=val;
    renderEditor();
    saveTemplate();
}

function setAlign(id,val){
    blocks.find(b=>b.id===id).styles.align=val;
    renderEditor();
    saveTemplate();
}


function deleteBlock(id){
    blocks=blocks.filter(b=>b.id!==id);
    activeId=null;
    renderEditor();
    settings.innerHTML="<p>Select a block</p>";
    saveTemplate();
}

function moveBlock(index,dir){
    let newIndex=index+dir;
    if(newIndex<0||newIndex>=blocks.length) return;
    [blocks[index],blocks[newIndex]]=[blocks[newIndex],blocks[index]];
    renderEditor();
    saveTemplate();
}


function saveTemplate(){
    let history=JSON.parse(localStorage.getItem("templateHistory"))||[];
    history.unshift(JSON.parse(JSON.stringify(blocks)));
    history=history.slice(0,2);
    localStorage.setItem("templateHistory",JSON.stringify(history));
    renderRecent();
}


function loadTemplates(){
    let history=JSON.parse(localStorage.getItem("templateHistory"))||[];
    blocks=history[0]||[];
    renderEditor();
    renderRecent();
}


function renderRecent(){
    let history=JSON.parse(localStorage.getItem("templateHistory"))||[];
    recentList.innerHTML="";
    history.forEach((t,i)=>{
        let div=document.createElement("div");
        div.className="recent-card";
        div.textContent="Template "+(i+1);
        div.onclick=()=>{
            blocks=t;
            renderEditor();
        };
        recentList.appendChild(div);
    });
}

function exportHTML() {
    let html = blocks.map(b => {

        let wrapperStyle = `
        background:${b.styles.background || 'transparent'};
        padding:${b.styles.padding || '0'};
        text-align:${b.styles.align || 'left'};
        `;


        if (b.type === "text") {
        return `
            <div style="${wrapperStyle}">
            <p style="
                margin:0;
                font-size:${b.styles.fontSize || '16px'};
                color:${b.styles.color || '#000'};
            ">
                ${b.content}
            </p>
            </div>
        `;
        }


        if (b.type === "image") {
        return `
            <div style="${wrapperStyle}">
            <img src="${b.content}" style="
                display:block;
                width:${b.styles.width || '300px'};
                height:${b.styles.height || 'auto'};
                max-width:100%;
                margin:${b.styles.align === 'center'
                ? '0 auto'
                : b.styles.align === 'right'
                ? '0 0 0 auto'
                : '0'};
            ">
            </div>
        `;
        }


        if (b.type === "button") {
        return `
            <div style="${wrapperStyle}">
            <a href="${b.styles.link || '#'}"
                target="_blank"
                style="
                display:inline-block;
                font-size:${b.styles.fontSize || '14px'};
                color:${b.styles.color || '#ffffff'};
                background:${b.styles.bgColor || '#2563eb'};
                text-decoration:none;
                padding:8px 16px;
                border-radius:6px;
                ">
                ${b.content}
            </a>
            </div>
        `;
        }


        if (b.type === "divider") {
        return `
            <div style="${wrapperStyle}">
            <hr style="margin:0;">
            </div>
        `;
        }

    }).join("");

    let blob = new Blob([html], { type: "text/html" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "email-template.html";
    a.click();
}
