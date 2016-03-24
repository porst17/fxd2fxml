package de.mfo.fxd2fxml;

import java.io.File;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.OutputKeys;

import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Text;

import java.lang.reflect.*;
import java.lang.annotation.*;

import java.util.*;

class Visitor
{
    public Set< Class > visitedFXClasses;

    Document doc;

    public Visitor( Document doc )
    {
        this.doc = doc;
        visitedFXClasses = new java.util.HashSet< Class >();
    }

    String mapTagName( Class tag )
    {
        if( com.sun.javafx.tools.fxd.FXD.class.equals( tag ) )
            tag = javafx.scene.Group.class;
        visitedFXClasses.add( tag );
        return tag.getSimpleName();
    }

    boolean isAttributeNameExportable( Class tag, String attribute )
    {
        if( com.sun.javafx.tools.fxd.FXD.class.isAssignableFrom( tag ) && attribute.equals( "libraries" ) )
            return false;
        else if( javafx.scene.image.Image.class.isAssignableFrom( tag ) && attribute.equals( "height" ) )
            return false;
        else if( javafx.scene.image.Image.class.isAssignableFrom( tag ) && attribute.equals( "width" ) )
            return false;
        else
            return true;
    }

    String mapAttributeName( Class tag, String attribute )
    {
        if( javafx.scene.Group.class.isAssignableFrom( tag ) && attribute.equals( "content" ) )
            return "children";
        else if ( javafx.scene.text.Text.class.isAssignableFrom( tag ) && attribute.equals( "content" ) )
            return "text";
        else if( attribute.equals( "id" ) )
            return "fx:id";
        else
            return attribute;
    }

    public Element visit( Object base )
    {
        if( com.sun.javafx.runtime.FXBase.class.isAssignableFrom( base.getClass() ) )
            return _visit( ( com.sun.javafx.runtime.FXBase ) base );
        else if( java.lang.Number.class.isAssignableFrom( base.getClass() ) )
            return _visit( ( java.lang.Number ) base );
        else
            throw new IllegalArgumentException( "unknown type: " + base.getClass() );
    }

    public Element _visit( java.lang.Number number )
    {
        Element e = doc.createElement( number.getClass().getName() );
        e.setAttribute( "fx:value", number.toString() );
        return e;
    }

    private Element _visit( com.sun.javafx.runtime.FXBase base )
    {
        Class c = base.getClass();
        Element e = doc.createElement( mapTagName( c ) );

        com.sun.javafx.runtime.FXBase defaultInstance = null;
        try
        {
            defaultInstance = ( com.sun.javafx.runtime.FXBase ) c.getConstructor().newInstance();
        }
        catch( Exception exception )
        {
            throw new RuntimeException( exception );
        }

        Field[] fields = c.getFields();
        for( Field f : fields )
        {
            if( f.getAnnotation( com.sun.javafx.runtime.annotation.Public.class ) != null
                || f.getAnnotation( com.sun.javafx.runtime.annotation.PublicInitable.class ) != null )
            {
                String mappedFieldName = mapAttributeName( c, f.getAnnotation( com.sun.javafx.runtime.annotation.SourceName.class ).value() );

                // no only process attributes that have a valid counterpart in FXML
                if( !isAttributeNameExportable( c, mappedFieldName ) )
                    continue;

                try
                {
                    if( f.get( defaultInstance ) != null && !f.get( defaultInstance ).equals( f.get( base ) )
                        || f.get( base ) != null && !f.get( base ).equals( f.get( defaultInstance ) )
                    )
                    {
                        if( f.get( base ) == null )
                        {
                            e.setAttribute( mappedFieldName, "${null}" );
                        }
                        else if( java.lang.Enum.class.isAssignableFrom( f.getType() )
                            || java.lang.String.class.isAssignableFrom( f.getType() )
                            || java.lang.Number.class.isAssignableFrom( f.getType() )
                            || int.class.isAssignableFrom( f.getType() )
                            || float.class.isAssignableFrom( f.getType() )
                            || boolean.class.isAssignableFrom( f.getType() )
                        )
                        {
                            if( mappedFieldName.equals( "fx:id" ) )
                                e.setAttribute( mappedFieldName, f.get( base ).toString().replace( ' ', '_' ) );
                            else if( javafx.scene.image.Image.class.isAssignableFrom( c ) && mappedFieldName.equals( "url" ) )
                            {
                                // assume image URL to be relative to the fxd files
                                e.setAttribute( mappedFieldName, "@" + f.get( base ) );
                            }
                            else
                                e.setAttribute( mappedFieldName, f.get( base ).toString() );
                        }
                        else if( com.sun.javafx.runtime.FXBase.class.isAssignableFrom( f.getType() ) )
                        {
                            Element attrElem = doc.createElement( mappedFieldName );                                attrElem.appendChild( visit( f.get( base ) ) );
                            e.appendChild( attrElem );
                        }
                        else if( com.sun.javafx.runtime.sequence.Sequence.class.isAssignableFrom( f.getType() ) )
                        {
                            Element attrElem = doc.createElement( mappedFieldName );
                            java.util.Iterator it = ( ( com.sun.javafx.runtime.sequence.Sequence ) f.get( base ) ).iterator();
                            while( it.hasNext() )
                                attrElem.appendChild( visit( it.next() ) );
                            e.appendChild( attrElem );
                        }
                        else
                        {
                            throw new IllegalArgumentException( "unknown field type: " + f.getType() );
                        }
                    }
                }
                catch( Exception exception )
                {
                    throw new RuntimeException( exception );
                }
            }
        }

        return e;
    }
}

public class Main
{
    public static < T > void printLines( T[] array )
    {
        for( T e : array )
            System.out.println( e.toString() );
    }

    public static Element traverse( javafx.scene.Node node, String indentation, Document doc )
    {
        Element element = doc.createElement( node.getClass().getSimpleName() );
        //System.out.println( indentation + node.getClass() );
        if( javafx.scene.Group.class.isAssignableFrom( node.getClass() ) )
        {
            indentation += "  ";
            javafx.scene.Group group = (javafx.scene.Group) node;
            for( int i = 0; i < group.size$children(); i++ )
            {
                element.appendChild( traverse( group.elem$children( i ), indentation, doc ) );
            }
        }
        return element;
    }

    public static void main(String[] args) throws Exception
    {
        if( args.length != 2 )
        {
            System.err.println( "usage: fxd2fxml in-file out-file" );
            System.exit( -1 );
        }

        Object o = javafx.fxd.FXDLoader.load( "file://" + args[ 0 ] );

        try
        {
            DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder docBuilder = docFactory.newDocumentBuilder();

            Document doc = docBuilder.newDocument();

            //Element fxdRootElement = traverse( (javafx.scene.Node) o, "", doc );
            Visitor v = new Visitor( doc );
            Element fxdRootElement = v.visit( ( javafx.scene.Group ) o );

            for( Class fxClass : v.visitedFXClasses )
            {
                doc.insertBefore(
                    doc.createProcessingInstruction( "import", fxClass.getName() ),
                    doc.getDocumentElement()
                );
            }

            fxdRootElement.setAttribute( "xmlns:xlink", "http://www.w3.org/1999/xlink" );
            fxdRootElement.setAttribute( "xmlns:svg", "http://www.w3.org/2000/svg" );
            fxdRootElement.setAttribute( "xmlns:fx", "http://javafx.com/fxml" );
            fxdRootElement.setAttribute( "xmlns:str", "http://exslt.org/strings" );

            doc.appendChild( fxdRootElement );

            // write the content into xml file
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty( OutputKeys.OMIT_XML_DECLARATION, "no" );
            transformer.setOutputProperty( OutputKeys.METHOD, "xml" );
            transformer.setOutputProperty( OutputKeys.INDENT, "yes" );
            transformer.setOutputProperty( OutputKeys.ENCODING, "UTF-8" );
            transformer.setOutputProperty( "{http://xml.apache.org/xslt}indent-amount", "4" );

            DOMSource source = new DOMSource( doc );
            StreamResult result = new StreamResult( new File( args[ 1 ] ) );

            // Output to console for testing
            //StreamResult result = new StreamResult(System.out);

            transformer.transform( source, result );
        }
        catch( ParserConfigurationException pce )
        {
            pce.printStackTrace();
        }
        catch( TransformerException tfe )
        {
            tfe.printStackTrace();
        }
    }
}
