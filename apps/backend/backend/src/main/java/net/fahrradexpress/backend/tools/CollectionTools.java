package net.fahrradexpress.backend.tools;

import java.util.Collection;

public class CollectionTools {

	public static boolean isEmpty(Collection<?> collection) {
		return collection == null || collection.size() == 0;
	}
}
