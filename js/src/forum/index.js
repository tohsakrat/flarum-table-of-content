import app from 'flarum/forum/app';
import  { extend, override } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';
import DiscussionPageResolver from 'flarum/forum/resolvers/DiscussionPageResolver';
import PostStreamScrubber from 'flarum/forum/components/PostStreamScrubber';
app.initializers.add('mypost', () => {
//console.log(12345)
  extend(CommentPost.prototype, 'oncreate', function () {
    //console.log(this);
    let clearPunctuation=(str)=>{;
      let reg=new RegExp( /[\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]/)
      return str.replace( reg ,'-').replaceAll(' ','-');
  }

  //console.log(this)
 // if(!this.element)return items
 
  let inPageLink=Array.prototype.slice.call(this.element.querySelectorAll('a[target="_self"]'))
  
     inPageLink.forEach((e)=>{
      if(e.href.indexOf(window.location.href.split('/').splice(0,4).join('/'))!=-1)e.onclick=(w)=>{
      
      w.preventDefault();
      
     app.current.data.stream.goToNumber(e.href.split('/')[5].split('#')[0]).then(()=>{
    		  if(e.href.split('/')[5])setTimeout(()=>{
    			//console.log(a)
    		  window.location.hash  =  '#'+ e.href.split('#')[1];
    		  setTimeout(()=>{ m.redraw();},100)
    		},500)}
    		)
      return false;
      
      }
    
    
    })
 
 
 
 
 
 
 
 
 
 
 
 
 
 
  let elements1=Array.prototype.slice.call(this.element.querySelectorAll('.Post-body :is(h1, h2, h3, h4, h5, h6)'))
  
  
  elements1.forEach((e,i)=>{
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
  this.catalog={}
  this.catalog.id=this.attrs.post.data.id
  
  app.current.data.stream.posts().find(u=>u.data.id== this.catalog.id).catalog=this.catalog
  this.catalog.elements=Array.prototype.slice.call(this.element.querySelectorAll('.Post-body :is(h1, h2, h3, h4, h5, h6,.sub-anchor)'))
  this.catalog.content=this.catalog.elements.map(
      (e)=>{
        
        let isAnchor=Array(e.classList).map(e=>e.value).indexOf('sub-anchor')!=-1
        let id=isAnchor? e.id : e.dataset.id
       let link=     window.location.origin+'/d/'+this.attrs.post.data.relationships.discussion.data.id + '/'+this.attrs.post.data.attributes.number+'#'+id
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
            },250)}
            )
            return false;
          }
        }
        >{e.innerText+'\n'}</a></p>
    
       
      
       // a= document.createTextNode(a)
       // console.log('#'+e.dataset.id)
       
        //this.element.querySelector('.Post-header').appendChild(a)
        
       //a=$(a)
       
        return a;
        //console.log(a)
       // console.log(items)
      //  items.push(a)
      //  console.log(a)
        //this.content[0]
      }
      )
      
   //   app.catalog={
    //    view:function(){
   //       return <div class="catalogDIV">{content}</div>
   //     }
      
  //    }

  //    app.catalog.content=this.catalog.content;

  //console.log('啊吧啊吧')


    // console.log(this)
    
     //console.log(CommentPost.prototype)



     //return items; 


    }); 


    extend(PostStreamScrubber.prototype, 'view', function (vnode){
      // if(app.current.data.stream.posts().filter((w)=>{return w.attributes.number==this.attrs.post.data.attributes.number})[0])app.current.data.stream.posts().filter((w)=>{return w.attributes.number==this.attrs.post.data.attributes.number})[0].catalog=this.catalog

      
        try{
        vnode.children.push(<div class='catalog-top'>
            {app.current.data.stream.posts().find(u=>u.data?.id==app.current.data.stream.posts()[Math.floor(app.current.data.stream.index-app.current.data.stream.visibleStart)-1>0?Math.floor(app.current.data.stream.index-app.current.data.stream.visibleStart)-1:0].data?.id)
           .catalog?.content}

        </div>)}catch (e){
            console.log(e)
        }
        //console.log( app.current.data.stream.posts().find(u=>u.data.id==app.current.data.stream.posts()[Math.floor(app.current.data.stream.index-app.current.data.stream.visibleStart)].data.id).catalog?.content)
           
       return vnode
 
 
       })
       
      // m.redraw()
  
      override(DiscussionPageResolver.prototype, 'onmatch', function (original, args, requestedPath, route){
        
      if (app.current.matches(DiscussionPage) && this.canonicalizeDiscussionSlug(args.id) === this.canonicalizeDiscussionSlug(m.route.param('id'))) {
        // By default, the first post number of any discussion is 1
       if(args.near!=m.route.param('near') || window.location.href.indexOf('#')==-1 )DiscussionPageResolver.scrollToPostNumber = args.near || 1;//在贴在路由不变情况下不要滚回开头

      }
     // console.log('original DicussionPageResolver')
      //console.log(this.__proto__.__proto__.onmatch)
      return this.__proto__.__proto__.onmatch.call(this, args, requestedPath, route);
    })

    override(DiscussionPageResolver.prototype, 'render', function (original, vnode){
      if (DiscussionPageResolver.scrollToPostNumber !== null) {
        const number = DiscussionPageResolver.scrollToPostNumber;
        // Scroll after a timeout to avoid clashes with the render.
        
       if(DiscussionPageResolver.scrollToPostNumber!=m.route.param('near')|| window.location.href.indexOf('#')==-1 ) setTimeout(() => app.current.get('stream').goToNumber(number));//在贴在路由不变情况下不要滚回开头
        
  
        DiscussionPageResolver.scrollToPostNumber = null;
      }
  
      return this.__proto__.__proto__.render(vnode);
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
      },500)
      setTimeout(()=>{
      window.location.hash  =   '#'+hash;
      },1000)
      }
      
      
      
      });
      
      
  
    })


    


    window.updateCatalogTop=()=>{
      m.redraw();
    }

        window.addEventListener('scroll', window.updateCatalogTop); 

   //this.catalog.children=app.current.data.stream?.posts()[app.current.data.stream.visible]
   //return callback;

   // document.querySelector("#content").dataset.streamNear=this.near
   // $('.item-scrubber>.Dropdown-menu.dropdown-menu')[0].append

  
})
  
  
