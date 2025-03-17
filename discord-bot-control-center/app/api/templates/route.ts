/**
 * テンプレート管理APIエンドポイント
 * Created: 2025/3/16
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';

/**
 * テンプレート一覧を取得するAPIエンドポイント
 * 
 * @param req リクエスト
 * @returns レスポンス
 */
export async function GET(req: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    
    if (!session && process.env.SKIP_AUTH !== 'true') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // クエリパラメータの取得
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    
    console.log('Fetching templates with category:', category);
    
    // テンプレート一覧を取得
    let query = supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data: templates, error } = await query;
    
    console.log('Templates result:', JSON.stringify(templates, null, 2));
    
    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { message: 'Failed to fetch templates', error: error.message },
        { status: 500 }
      );
    }
    
    if (!templates) {
      return NextResponse.json(
        { message: 'Failed to fetch templates' },
        { status: 500 }
      );
    }
    
    // テンプレートデータを整形
    const formattedTemplates = templates.map((template) => {
      // タグ情報がない場合は空配列を設定
      if (!template.command_structure) {
        template.command_structure = {};
      }
      
      if (!template.command_structure.tags) {
        template.command_structure.tags = [];
      }
      
      return template;
    });
    
    return NextResponse.json(formattedTemplates);
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * テンプレートを作成するAPIエンドポイント
 * 
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    
    if (!session && process.env.SKIP_AUTH !== 'true') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
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
      isPublic = false
    } = body;
    
    // バリデーション
    if (!name || !description || !category || !commandStructure) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // テンプレートを作成
    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        category,
        command_structure: commandStructure,
        prompt_structure: promptStructure || null,
        api_integration_structure: apiIntegrationStructure || null,
        is_public: isPublic,
        user_id: session?.user?.id || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { message: 'Failed to create template', error: error.message },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { message: 'Failed to create template' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating template:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
