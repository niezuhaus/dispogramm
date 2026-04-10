package net.fahrradexpress.backend.clients;

import java.util.List;

import org.springframework.web.reactive.function.client.WebClient;

public abstract class AbstractClient {

	protected WebClient client;
	
	public AbstractClient(String url) {
		client = WebClient.create(url);
	}
	
	protected <T> T get(String uri, Class<T> clazz) {
		return client.get()
				.uri(uri)
				.retrieve()
				.toEntity(clazz)
				.block()
				.getBody();
	}
	
	protected <T> List<T> getList(String uri, Class<T> clazz) {
		return client.get()
				.uri(uri)
				.retrieve()
				.toEntityList(clazz)
				.block()
				.getBody();
	}
	
	protected <T,V extends Object> T post(String uri, Class<T> responseClazz, V requestBody) {
		return client.post()
				.uri(uri)
				.bodyValue(requestBody)
				.retrieve()
				.toEntity(responseClazz)
				.block()
				.getBody();
	}
	
	protected <T,V extends Object> List<T> postList(String uri, Class<T> responseClazz, V requestBody) {
		return client.post()
				.uri(uri)
				.bodyValue(requestBody)
				.retrieve()
				.toEntityList(responseClazz)
				.block()
				.getBody();
	}
	
}
