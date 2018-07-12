kiwi.plugin('pollingPlugin', function(kiwi, log) {
  let buttonAdded = dashVisible = false;
  let autoOpen = kiwi.state.setting('polling.autoOpen') || false;
  
  if(!buttonAdded){
    buttonAdded = true;
    const pluginTool = document.createElement('i');
    pluginTool.className = 'fa fa-comment';
    kiwi.addUi('input', pluginTool);
    pluginTool.onclick = function(e){ 
      e.preventDefault();
      if(dashVisible){
        hideDash();
      }else{
        showDash();
      }
    }
    if (autoOpen) {
      let initOpen = setInterval(() => {
        network = window.kiwi.state.getActiveNetwork();
        if (network.buffers[1].joined) {
          clearInterval(initOpen);
          showDash();
        }
      },100);
    }
  }
  
  function iframeizeDash(){
    kiwi.emit('mediaviewer.show', { iframe: true, url: 'about:blank' });
    setTimeout(() => {
      let iframe = document.querySelector('.kiwi-mediaviewer iframe');
      let mediaviewer = document.querySelector('.kiwi-mediaviewer');
      let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      pluginBody = innerDoc.getElementsByTagName('body')[0];
      pluginHead = innerDoc.getElementsByTagName('head')[0];
      iframe.style.width = '100%';
      mediaviewer.style.height = '45%';
      iframe.style.height = '100%';
      let style = innerDoc.createElement("link");
      style.rel = 'stylesheet';
      style.type = 'text/css';
      style.href = './static/plugins/plugin-polling/style.css';
      let vueMin = innerDoc.createElement("script");
      vueMin.src = 'https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.16/vue.min.js';
      pluginHead.appendChild(style);
      pluginHead.appendChild(vueMin);
      vueMin.addEventListener('load', function () {
        pluginBody.innerHTML = `
          <div id="polling-container">
            <div class="titleText">
              <a href="http://irc.com" target="_blank">IRC.com</a>
              Polling Service
            </div>
            <button class="minimizeSettingsButton" @click="toggleSettings">{{settingsButtonText}}</button><br>
            <transition name="container-transition" mode="out-in">
              <div v-if="settingsButtonText==='Hide Settings'" class="settings">
                <span class="sectionTitle">Settings</span><hr>
                <input id="receive" type="checkbox" v-model="receive"/>
                <label for="receive">Notify me of new queries</label>
              </div>
            </transition>
            <div class="queries">
              <span class="sectionTitle">Queries</span><hr>
              <div class="query" v-for="(query, idx) in queries" :key="query">
                {{idx+1}})
                <span class="queryText">{{query.statement}}</span><br>
                Please choose a response:
                <ul>
                  <li v-for="answer in query.answers" :key="answer">
                    <input type="radio" :id="query.statement+answer" :value="answer" v-model="query.chosenAnswer"/>
                    <label :for="query.statement+answer">{{answer}}</label>
                  </li>
                  <button :disabled="query.chosenAnswer === ''" @click="submitAnswer(idx,query.chosenAnswer)">Submit Answer</button>
                </ul>
              </div>
            </div>
          </div>
        `;
        let vueScript = innerDoc.createElement("script");
        vueScript.innerHTML = `
          new Vue({
            el: '#polling-container',
            data: function () {
              return {
                receive: true,
                settingsButtonText: 'Show Settings',
                queries: [
                  {
                    statement: 'What color is they sky?',
                    answers: [
                      'blue',
                      'grey',
                      'clear',
                      'I\\'m blind'
                    ],
                    chosenAnswer: ''
                  },
                  {
                    statement: 'How many atoms are in the universe?',
                    answers: [
                      '60',
                      '2^100',
                      'infinite',
                      'I didn\\'t study :('
                    ],
                    chosenAnswer: ''
                  }
                ]
              }
            },
            computed: {
            },
            methods: {
              toggleSettings () {
                if (this.settingsButtonText === 'Hide Settings') {
                  this.settingsButtonText = 'Show Settings';
                } else {
                  this.settingsButtonText = 'Hide Settings';
                }
              },
              submitAnswer (queryIDX, chosenAnswer) {
                alert("query: " + this.queries[queryIDX].statement + "\\nAnswer: " + chosenAnswer);
              }
            }
          })
        `;
        pluginBody.appendChild(vueScript);
      });
    }, 100);
  }
  
  function showDash(){
    if(!dashVisible){
      dashVisible = true;
      iframeizeDash();
    }
  }

  function hideDash(){
    kiwi.emit('mediaviewer.hide');
  }
  
  kiwi.on('mediaviewer.opened', function(){
    mediaViewerOpen = true;
  });
  
  kiwi.on('mediaviewer.hide', function(){
    mediaViewerOpen = false;
    dashVisible = false;
  });
});
