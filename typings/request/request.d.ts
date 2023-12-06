declare namespace Request {
	type Respose<T = any> = {
		code: number;
		isOk: boolean;
		msg: string;
		data: T;
	};

	type QueryResponse<T = any> = Request.Respose<{
		current: number;
		pages: number;
		size: number;
		total: number;
		record: T;
	}>;

	type PageParams = {
		page: number;
		size: number;
	};
}
