
 var parseCode=function(txt){
 	var errorHappened=false;
 	try{
		parser.parse(txt);
	}catch(err){
		console.log(err);
		errorHappened=true;
	}

	var genTree=function(node,curPos){

		var tree=$('<li>'+node.name+'</li>');
		var span=$('<code></code>');
		tree.data('twin',span);
		span.data('twin',tree);
		if(node.children.length==0){//base node
			var innerTxt='';
			if(curPos.line!==node.loc.first_line){
				curPos.col=0;
			}
			while(curPos.line<node.loc.first_line){
				innerTxt+='<br>';
				curPos.line++;
			}
			while(curPos.col<node.loc.first_column){
				innerTxt+='&nbsp;';
				curPos.col++;
			}

			span.html(innerTxt+node.semantic);
			curPos.col+=node.semantic.length;
		}
		try{
			var childrenTree=node.children.map(function(x){ return genTree(x,curPos);});
		}catch(err){
			console.log(node);
		}
		var innerUL=$('<ul></ul>');
		for(var i=0;i<childrenTree.length;i++){
			var curTree=childrenTree[i];
			innerUL.append(curTree.tree);
			span.append(curTree.span);
		}
		tree.append(innerUL);
		/*var inHover=function(){
			console.log('inHover');
			$(this).data('twin').addClass('border');
		}
		var outHover=function(){
			console.log('outHover');
			$(this).data('twin').removeClass('border');
		}
		tree.hover(inHover,outHover);
		span.hover(inHover,outHover);*/
		return {tree:tree,span:span};	
	}
	if(errorHappened){
		AST.reduce('ERROR',AST.stack.length);
	}
	var tree=genTree(AST.stack[0],{line:0,col:0});
	/* 
		evt propagation
	*/
	var lastHovered=undefined;
	var inHover=function(evt){
		if(lastHovered!==undefined){
			lastHovered.data('twin').removeClass('border');
			lastHovered.removeClass('border');
		}
		lastHovered=$(this);
		lastHovered.data('twin').addClass('border');
		lastHovered.addClass('border');
		evt.stopPropagation();
	};

	tree.tree.on('mouseover','li',inHover);
	tree.tree.on('mouseleave',function(){
		lastHovered.data('twin').removeClass('border');
		lastHovered.removeClass('border');
		lastHovered=undefined;
	});
	tree.span.on('mouseover','code',inHover);
	tree.span.on('mouseleave',function(){
		lastHovered.data('twin').removeClass('border');
		lastHovered.removeClass('border');
		lastHovered=undefined;
	})

	$('.tree').append(tree.tree);
	$('.text').append(tree.span);
}
$(document).ready(function(){
	console.log("submit: ",$('#submit'));
	$('#submit').on('click',function(){
		console.log('html:' +$("#code").val());
		parseCode($("#code").val());
	});
});