// 在网页上，可以针对 某一页 来快速排序 数组

// BLOCK_MAX: 分块数量
// BLOCK_SPAN: 分块跨度
// sort_type: ascent / descent
function sortNumKeyPage(datas, BLOCK_MAX, BLOCK_SPAN, sort_key, sort_type, user_page, PAGE_NUM) {

	console.time("make.block_list");
	let block_list = [];
	{
		for (let i = 0; i < BLOCK_MAX; i++) {
			block_list.push({start:i*BLOCK_SPAN, end:(i+1)*BLOCK_SPAN, datas:[]});
		}
		block_list.push({start:BLOCK_MAX*BLOCK_SPAN, datas:[]});
		datas.forEach((one)=>{
			for (let i = 0; i < block_list.length; i++) {
				let block = block_list[i];
				let value = one[sort_key];
				if (null==value || undefined==value) {
					value = 0;
				}
				if ((null!=block.start && undefined!=block.start) && (null!=block.end && undefined!=block.end)) {
					if (block.start<=value && value<block.end) {
						block.datas.push(one);
						break;
					}
				} else if ((null!=block.start && undefined!=block.start) && (null==block.end && undefined==block.end)) {
					if (block.start <= value) {
						block.datas.push(one);
						break;
					}
				} else if ((null==block.start || undefined==block.start) && (null!=block.end && undefined!=block.end)) {
					if (value < block.end) {
						block.datas.push(one);
						break;
					}
				} else if ((null==block.start || undefined==block.start) && (null==block.end || undefined==block.end)) {
					//console.log("block invalid:", block);
					break;
				}
			}
		});
		console.log("block_list:", block_list.length);
	}
	console.timeEnd("make.block_list");

	console.time("calculate.user_start_end");
	let user_start = 0;
	let user_end = PAGE_NUM;
	{
		let total_count = 0;
		block_list.forEach((b)=>{
			total_count += b.datas.length;
		});
		console.log("total_count:", total_count);

		let total_page = Math.ceil(total_count/PAGE_NUM);
		console.log("total_page:", total_page);

		user_start = user_page * PAGE_NUM;
		user_end = user_start + PAGE_NUM;
		console.log("user_page:", user_page, "/", total_page, "user_start_end:", user_start, "-", user_end, "/", total_count);
	}
	console.timeEnd("calculate.user_start_end");

	// make need sort datas
	console.time("make.need_sort_datas");
	let need_sort_datas = [];
	let pass_count = 0;
	{
		if ("descent" == sort_type) {
			for (let i = block_list.length-1; i >=0; i--) {
				let block = block_list[i];
				pass_count += block.datas.length;
				console.log(i, "block:", block.datas.length, "pass_count:", pass_count);

				if (pass_count >= user_start) {
					need_sort_datas = need_sort_datas.concat(block.datas);
				}
				if (pass_count <= user_end) {
					break;
				}
			}
		}
		if ("ascent" == sort_type) {
			for (let i = 0; i < block_list.length; i++) {
				let block = block_list[i];
				pass_count += block.datas.length;
				console.log(i, "block:", block.datas.length, "pass_count:", pass_count);

				if (pass_count >= user_start) {
					need_sort_datas = need_sort_datas.concat(block.datas);
				}
				if (pass_count <= user_end) {
					break;
				}
			}
		}
		console.log("need_sort_datas:", need_sort_datas.length);
	}
	console.timeEnd("make.need_sort_datas");

	console.time("sort.datas");
	let sort_datas = [];
	{
		sort_datas = need_sort_datas.sort((a,b)=>{
			let num_a = a[sort_key];
			let num_b = b[sort_key];
			if (null==num_a || undefined==num_a) { num_a = 0; }
			if (null==num_b || undefined==num_b) { num_b = 0; }

			if ("ascent" == sort_type) {
				return (num_a > num_b ? 1 : -1);
			} else if ("descent" == sort_type) {
				return (num_a > num_b ? -1 : 1);
			} else {
				return 0;
			}
		});
	}
	console.timeEnd("sort.datas");

	let index_start = sort_datas.length - (pass_count - user_start);
	let ret_datas = sort_datas.slice(index_start, index_start+PAGE_NUM);
	console.log("ret_datas:", ret_datas.length);

	return ret_datas;
}
