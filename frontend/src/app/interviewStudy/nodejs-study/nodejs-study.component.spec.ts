import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodejsStudyComponent } from './nodejs-study.component';

describe('NodejsStudyComponent', () => {
  let component: NodejsStudyComponent;
  let fixture: ComponentFixture<NodejsStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodejsStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodejsStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
