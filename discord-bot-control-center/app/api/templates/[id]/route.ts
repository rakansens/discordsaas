/**
 * テンプレート詳細APIエンドポイント
 * Created: 2025/3/16
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';

/**
 * テンプレート詳細を取得するAPIエンドポイント
 * 
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    
    if (!session && process.env.SKIP_AUTH !== 'true') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: 'Invalid template ID' },
        { status: 400 }
      );
    }
    
    console.log('Fetching template with ID:', id);
    
    // テンプレート詳細を取得
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();
    
    console.log('Template result:', data);
    
    if (error) {
      console.error('Error fetching template:', error);
      return NextResponse.json(
        { message: 'Failed to fetch template', error: error.message },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * テンプレートを更新するAPIエンドポイント
 * 
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    
    if (!session && process.env.SKIP_AUTH !== 'true') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: 'Invalid template ID' },
        { status: 400 }
      );
    }
    
    // リクエストボディの取得
    const body = await req.json();
    const { 
      name, 
      description, 
      category, 
      commandStructure, 
      promptStructure, 
      apiIntegrationStructure,
      isPublic
    } = body;
    
    // 更新対象のテンプレートが存在するか確認
    const { data: existingTemplate, error: checkError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (checkError) {
      console.error('Error checking template existence:', checkError);
      return NextResponse.json(
        { message: 'Failed to check template existence', error: checkError.message },
        { status: 500 }
      );
    }
    
    if (!existingTemplate) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }
    
    // 更新データの準備
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (commandStructure !== undefined) updateData.command_structure = commandStructure;
    if (promptStructure !== undefined) updateData.prompt_structure = promptStructure;
    if (apiIntegrationStructure !== undefined) updateData.api_integration_structure = apiIntegrationStructure;
    if (isPublic !== undefined) updateData.is_public = isPublic;
    
    // テンプレートを更新
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating template:', updateError);
      return NextResponse.json(
        { message: 'Failed to update template', error: updateError.message },
        { status: 500 }
      );
    }
    
    if (!updatedTemplate) {
      return NextResponse.json(
        { message: 'Failed to update template' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedTemplate);
  } catch (error: any) {
    console.error('Error updating template:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * テンプレートを削除するAPIエンドポイント
 * 
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    
    if (!session && process.env.SKIP_AUTH !== 'true') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: 'Invalid template ID' },
        { status: 400 }
      );
    }
    
    // 削除対象のテンプレートが存在するか確認
    const { data: existingTemplate, error: checkError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "Row not found" error
      console.error('Error checking template existence:', checkError);
      return NextResponse.json(
        { message: 'Failed to check template existence', error: checkError.message },
        { status: 500 }
      );
    }
    
    if (!existingTemplate) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }
    
    // テンプレートを削除
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting template:', deleteError);
      return NextResponse.json(
        { message: 'Failed to delete template', error: deleteError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
