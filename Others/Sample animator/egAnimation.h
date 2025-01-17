// *************************************************************************************************
//
// Horde3D
//   Next-Generation Graphics Engine
// --------------------------------------
// Copyright (C) 2006-2009 Nicolas Schulz
//
// This software is distributed under the terms of the Eclipse Public License v1.0.
// A copy of the license may be obtained at: http://www.eclipse.org/legal/epl-v10.html
//
// *************************************************************************************************

#ifndef _egAnimation_H_
#define _egAnimation_H_

#include "egPrerequisites.h"
#include "egResource.h"
#include "utMath.h"


// =================================================================================================
// Animation Resource
// =================================================================================================

struct AnimationResData
{
	enum List
	{
		EntityElem = 300,
		EntFrameCountI
	};
};

// =================================================================================================

struct Frame
{
	Quaternion  rotQuat;
	Vec3f       transVec, scaleVec;
	Matrix4f    bakedTransMat;
};


struct AnimResEntity
{
	std::string           name;
	Matrix4f              firstFrameInvTrans;
	std::vector< Frame >  frames;
};

// =================================================================================================

class AnimationResource : public Resource
{
private:

	uint32                        _numFrames;
	std::vector< AnimResEntity >  _entities;

	bool raiseError( const std::string &msg );

public:

	static Resource *factoryFunc( const std::string &name, int flags )
		{ return new AnimationResource( name, flags ); }
	
	AnimationResource( const std::string &name, int flags );
	~AnimationResource();
	Resource *clone();
	
	void initDefault();
	void release();
	bool load( const char *data, int size );

	int getElemCount( int elem );
	int getElemParamI( int elem, int elemIdx, int param );

	AnimResEntity *findEntity( const std::string &name );

	friend class Renderer;
	friend class ModelNode;
};

typedef SmartResPtr< AnimationResource > PAnimationResource;


// =================================================================================================
// Animation Controller
// =================================================================================================

const uint32 MaxNumAnimStages = 16;

class IAnimatableNode
{
public:
	virtual ~IAnimatableNode() {}
	virtual const std::string &getANName() = 0;
	virtual IAnimatableNode *getANParent() = 0;
	virtual Matrix4f &getANRelTransRef() = 0;
	virtual bool &getANIgnoreAnimRef() = 0;
};

struct AnimStage
{
	PAnimationResource  anim;
	int                 layer;
	float               animTime;
	float               weight;
	std::string         startNode;
	bool                additive;
};

struct AnimCtrlNode
{
	IAnimatableNode  *node;
	AnimResEntity    *animEntities[MaxNumAnimStages];
};

class AnimationController
{
protected:

	std::vector< AnimStage * >   _animStages;
	std::vector< uint32 >        _activeStages;
	std::vector< AnimCtrlNode >  _nodeList;
	bool                         _dirty;

	void mapAnimRes( uint32 node, uint32 stage );
	void updateActiveList();

public:
	
	AnimationController();
	~AnimationController();
	
	void clearNodeList();
	void registerNode( IAnimatableNode *node );
	
	bool setupAnimStage( int stage, AnimationResource *anim, int layer,
	                     const std::string &startNode, bool additive );
	bool setAnimParams( int stage, float time, float weight );
	bool animate();
};

#endif // _egAnimation_H_


