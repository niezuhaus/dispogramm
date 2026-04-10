package net.fahrradexpress.backend.tools;

public class StringTools {
	
	public static boolean isEmpty(String text) {
		return text == null || text.trim().isEmpty();
	}
	
	public static boolean stringEquals(String string1, String string2) {
		if (string1 == null && string2 == null ) {
			return true;
		}
		else if (string1 == null | string2 == null) {
			return false;
		}
		else {
			return string1.equals(string2);
		}
	}
	
	public static boolean stringAlmostEquals(String string1, String string2) {
		return stringEquals(string1, string2) || (isEmpty(string2) && isEmpty(string2));
	}

}
