import app from 'flarum/forum/app';
import  { extend, override } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';
import DiscussionPageResolver from 'flarum/forum/resolvers/DiscussionPageResolver';
import PostStreamScrubber from 'flarum/forum/components/PostStreamScrubber';
import PostStream from 'flarum/forum/components/PostStream';

app.initializers.add('mypost', () => {
//console.log(12345)
  extend(CommentPost.prototype, 'oncreate', function () {
    //console.log(this);
    let clearPunctuation=(str)=>{;
      let reg=new RegExp( /[\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]/)
      return str.replace( reg ,'-').replaceAll(' ','-');
  }

 //这一段母的是把页面内指向同一个discussion的链接改为跳转到楼层，这样就不用重载整个页面
  let inPageLink=Array.prototype.slice.call(this.element.querySelectorAll('a'))
  
     inPageLink.forEach((e)=>{
      let curDiscussionRoute=window.location.href.replace("https://",'').split('/').splice(0,3).join('/');
      if(e.href.indexOf(curDiscussionRoute)!=-1)e.onclick=(w)=>{
        //如果链接指向的是当前页面的同一个discussion，就不要重载页面了
        let goTo=e.href.split('/')[5].split('#')[0];
        console.log('点击了链接,即将前往楼层'+goTo);
        w.preventDefault();  
        if(Math.floor(app.current.data.stream.number)==goTo){
          //如果和当前所在楼层相同，就不要滚动了
          console.log('当前所在楼层和目标楼层相同，不滚动');
          window.location.hash  =  '#'+ e.href.split('#')[1];
        return;}
        app.current.data.stream.goToNumber(goTo).then(()=>{
                console.log('goto完毕');
              
    		  if(e.href.split('/')[5])setTimeout(()=>{
            window.location.hash  =  '#'+ e.href.split('#')[1];
            setTimeout(()=>{ m.redraw();},100)
    		  },500)}
      	)
      return false;
      
      }
    
    
    })
 
 
 //这一段开始，是生成目录

 //先把所有标题找出来
  let elements1=Array.prototype.slice.call(this.element.querySelectorAll('.Post-body :is(h1, h2, h3, h4, h5, h6)'))
  
  elements1.forEach((e,i)=>{
    //这一段是给标题加上锚点，以及给锚点加上id
    //不直让标题本身作为滚动id是因为，这样不会让标题本身滚动到屏幕中间，而是顶部
    let anchor=e
    while(1){
      anchor = anchor.parentNode
      if(anchor.dataset.number)break
    }
    e.innerHTML='<span class="title-anchor"></span>'+ '<span class="title-sub-anchor">'+ e.innerHTML+'</span>'; 
   //e.id=
    e.dataset.id=anchor.dataset.number+'-'+clearPunctuation(e.innerText)+'-'+(elements1.map(k=>clearPunctuation(k.innerText)).filter(b=>b==clearPunctuation(e.innerText)).length==1?'':i);;
    e.className+=' title-has-anchor';
    e.querySelector('.title-anchor').id = e.dataset.id;
    e.querySelector('.title-sub-anchor').id = e.dataset.id;
   
  })

  //这一段是生成目录
  this.catalog={}
  this.catalog.id=this.attrs.post.data.id
  app.current.data.stream.posts().find(u=>u.data.id== this.catalog.id).catalog=this.catalog//把目录加到stream数据模型对应的post里面去
  this.catalog.elements=elements1

  this.catalog.content=this.catalog.elements.map(
      (e)=>{
        //这一段是通过标题数组的数据模型，生成目录的html
        let isAnchor=Array(e.classList).map(e=>e.value).indexOf('sub-anchor')!=-1
        let id=isAnchor? e.id : e.dataset.id
        let link= window.location.origin+app.route.discussion(app.current.data.discussion,this.attrs.post.data.attributes.number)+'#'+id;
       
        let a=<p> <a
        href={link}
        target='_self'
        data-number={this.attrs.post.data.attributes.number}
        data-isAnchor={isAnchor}
        data-id={id}
        data-tag={e.tagName}
        onclick={(u)=>{  

          u.preventDefault();
           app.current.data.stream.goToNumber(a.dom.dataset.number).then(()=>{
              setTimeout(()=>{
                //console.log(a)
              window.location.hash  =  '#'+ id;
               setTimeout(()=>{ m.redraw();},100)
            },500)}
            )
            return false;
          }
        }
        >{e.innerText+'\n'}</a></p>

        return a;
      }
      )
      

    }); 


    extend(PostStreamScrubber.prototype, 'view', function (vnode){
      // if(app.current.data.stream.posts().filter((w)=>{return w.attributes.number==this.attrs.post.data.attributes.number})[0])app.current.data.stream.posts().filter((w)=>{return w.attributes.number==this.attrs.post.data.attributes.number})[0].catalog=this.catalog

      if(!app.current)return;
      //这一段时把滚动元素添加页面上
        try{
            
            
         if(app.current?.data?.stream?.posts().find(u=>u.data?.id==app.current.data.stream.posts()[Math.floor(app.current.data.stream.index-app.current.data.stream.visibleStart)-1>0?Math.floor(app.current.data.stream.index-app.current.data.stream.visibleStart)-1:0].data?.id)
        .catalog?.content.length) vnode.children.push(
            <div class='catalog-icon-mobile'
            onclick={()=>{document.querySelector('.PostStreamScrubber.Dropdown.App-titleControl>button.Button.Dropdown-toggle:first-child').click()}}
            ></div>
        )
        
        vnode.children.push(<div class='catalog-top'>
            {app?.current?.data?.stream?.posts().find(u=>u?.data?.id==app.current?.data?.stream?.posts()[Math.floor(app.current?.data?.stream?.index-app.current?.data?.stream?.visibleStart)-1>0?Math.floor(app.current?.data?.stream?.index-app.current?.data?.stream?.visibleStart)-1:0].data?.id)
           .catalog?.content}

        </div>)
            
            
        }catch (e){
            console.log(e)
        }
        //console.log( app.current.data.stream.posts().find(u=>u.data.id==app.current.data.stream.posts()[Math.floor(app.current.data.stream.index-app.current.data.stream.visibleStart)].data.id).catalog?.content)
           
       return vnode
 
 
       })
       
      // m.redraw()
  
      override(DiscussionPageResolver.prototype, 'onmatch', function (original, args, requestedPath, route){
        
      //这一端是为了阻止有id时flarum原生的滚动
      if (app.current.matches(DiscussionPage) && this.canonicalizeDiscussionSlug(args.id) === this.canonicalizeDiscussionSlug(m.route.param('id'))) {
        // By default, the first post number of any discussion is 1
       if(args.near!=m.route.param('near') || window.location.href.indexOf('#')==-1 )DiscussionPageResolver.scrollToPostNumber = args.near || 1;//在贴在路由不变情况下不要滚回开头

      }
      
      
      return this.__proto__.__proto__.onmatch.call(this, args, requestedPath, route);
    })

    override(DiscussionPageResolver.prototype, 'render', function (original, vnode){
      if (DiscussionPageResolver.scrollToPostNumber !== null) {
        const number = DiscussionPageResolver.scrollToPostNumber;
        // Scroll after a timeout to avoid clashes with the render.
        
       if(DiscussionPageResolver.scrollToPostNumber!=m.route.param('near')|| window.location.href.indexOf('#')==-1 ) setTimeout(() => app.current.get('stream').goToNumber(number));//在贴在路由不变情况下不要滚回开头
        
  
        DiscussionPageResolver.scrollToPostNumber = null;
      }
  
      return this.__proto__.__proto__.render.call(this,vnode);
    })




     extend(DiscussionPage.prototype, 'show', function (discussion){
         
         if(window.location.href.indexOf('#')!=-1 && window.location.href.split('#').length==2){
          setTimeout(()=>{
          window.location.hash  =   '#'+hash;
          },250)
          setTimeout(()=>{
          window.location.hash  =   '#'+hash;
          },500)
          }
         
         
     })

    override(DiscussionPage.prototype, 'render', function (original,discussion){
          app.history.push('discussion', discussion.title());
          app.setTitle(discussion.title());
          app.setTitleCount(0);
          console.log('DiscussionPage-overide')
          // When the API responds with a discussion, it will also include a number of
          // posts. Some of these posts are included because they are on the first
          // page of posts we want to display (determined by the `near` parameter) –
          // others may be included because due to other relationships introduced by
          // extensions. We need to distinguish the two so we don't end up displaying
          // the wrong posts. We do so by filtering out the posts that don't have
          // the 'discussion' relationship linked, then sorting and splicing.
          let includedPosts = [];
          if (discussion.payload && discussion.payload.included) {
            const discussionId = discussion.id();
      
            includedPosts = discussion.payload.included
              .filter(
                (record) =>
                  record.type === 'posts' &&
                  record.relationships &&
                  record.relationships.discussion &&
                  !Array.isArray(record.relationships.discussion.data) &&
                  record.relationships.discussion.data.id === discussionId
              )
              // We can make this assertion because posts should be in the store,
              // since they were in the discussion's payload.
              .map((record) => app.store.getById('posts', record.id) )
              .sort((a, b) => a.number() - b.number())
              .slice(0, 20);
          }
      
          // Set up the post stream for this discussion, along with the first page of
          // posts we want to display. Tell the stream to scroll down and highlight
          // the specific post that was routed to.
          this.stream = new PostStreamState(discussion, includedPosts);
          const rawNearParam = m.route.param('near');
          const nearParam = rawNearParam === 'reply' ? 'reply' : parseInt(rawNearParam);
        
          this.stream.goToNumber(nearParam || (includedPosts[0]?.number() ?? 0), true).then(() => {
            this.discussion = discussion;
      
            app.current.set('discussion', discussion);
            app.current.set('stream', this.stream);
            
          if(window.location.href.indexOf('#')!=-1 && window.location.href.split('#').length==2){
          let hash=window.location.href.split('#')[1]
          
          setTimeout(()=>{
          window.location.hash  =   '#'+hash;
          },300)
          setTimeout(()=>{
          window.location.hash  =   '#'+hash;
          },1000)
          }
          
          
          
          });
      
      
  
    })


    /**
   * When the posts that are visible in the post stream change (i.e. the user
   * scrolls up or down), then we update the URL and mark the posts as read.
   */

    override(DiscussionPage.prototype, 'positionChanged', function(original,startNumber, endNumber){
        const discussion = this.discussion;
    
        if (!discussion) return;
    
        // Construct a URL to this discussion with the updated position, then
        // replace it into the window's history and our own history stack.
        const url = app.route.discussion(discussion, (this.near = startNumber))+(window.location.hash.substr(1).split('-')[0]==this.near?window.location.hash:'');
    
        window.history.replaceState(null, document.title, url);
        app.history.push('discussion', discussion.title());
    
        // If the user hasn't read past here before, then we'll update their read
        // state and redraw.
        if (app.session.user && endNumber > (discussion.lastReadPostNumber() || 0)) {
          discussion.save({ lastReadPostNumber: endNumber });
          m.redraw();
        }
  });
  
  
  

    //这一段开始是给帖子加进度条
    window.updateCatalogTop=()=>{
    if(!app?.current?.data?.stream?.index)return;
     let footer = document.querySelector( '.PostStream-item[data-index="'+Math.floor(app?.current?.data?.stream?.index-1) +'"]'+" li.item-progress")
     app.current.data.stream.progress=Math.floor((app.current.data.stream.index-Math.floor(app.current.data.stream.index))*100) 
     if(!footer)return;
     footer.innerText= Math.floor(app.current.data.stream.progress+ app.current.data.stream.percentScreenPost/3)+'%'  
      m.redraw();
      
     
     if(app.current.data.stream.progress>100-app.current.data.stream.percentScreenPost || app.current.data.stream.progress<app.current.data.stream.percentScreenPost){
         
        let element2=document.querySelector(
         '.PostStreamCurrent'
        )
        
        if(!element2)return
        element2.className=element2.className.replaceAll('PostStreamCurrent','')
     }
     
     

    }

        window.addEventListener('scroll', window.updateCatalogTop); 
        window.addEventListener('touchmove', window.updateCatalogTop); 



   window.updateCurrentPostClass=()=>{
       
         if(!app?.current?.data?.stream?.index)return;
         
         //自动关灯
         let classList=document.querySelector(".DiscussionPage-discussion").className.split(' ');
         
       if(app?.current?.data?.stream?.index>1.2) {
           
           if(classList.indexOf('streamNotFirst')==-1)classList.push('streamNotFirst')
       }else{
           
           classList=classList.filter((e)=>e!='streamNotFirst')
       }
       
       document.querySelector(".DiscussionPage-discussion").className=classList.join(' ')
       
       //升级阅读进度
         var element1=document.querySelector(
         '.PostStream-item[data-index="'+Math.floor(app.current.data.stream.index-1) +'"]'
        )
        
        app.current.data.stream.percentScreenPost = (window.innerHeight-40)/element1.scrollHeight*100-2;
        
 
        var element2=document.querySelector(
         '.PostStreamCurrent'
        )
        if(element1==element2 || !element1)return;
        
        
        if(
        element1.scrollHeight<window.innerHeight ||
        app.current.data.stream.progress>100-app.current.data.stream.percentScreenPost || 
        app.current.data.stream.progress<app.current.data.stream.percentScreenPost
        ){
            
            //不需要进度条的帖子
            if( !element2)return;
            
            element2.className=element2.className.replaceAll('PostStreamCurrent','')
            
        }else{
      
        
         element1.className+=' PostStreamCurrent'
        if(!element2)return;
        element2.className=element2.className.replaceAll('PostStreamCurrent','')
        
        }
     }
      window.addEventListener('scroll',window.updateCurrentPostClass); 
        window.addEventListener('touchmove', window.updateCurrentPostClass); 
        
        
        
    extend(CommentPost.prototype, 'actionItems', function (items) {
        items.add(
          'progress',
          
           <span></span>
           
          
          ,10
        );
     });
  
  


  
})
  
  
